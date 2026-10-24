# Wobble

Wobble is a local tool that hunts order-dependent pytest failures. It runs a test suite in shuffled orders, reports an observed failure rate with a 95% Wilson interval, and reduces a failing order to a small set of earlier tests.

The first version is a CLI. It can run a trusted repository in fresh Python processes or run each experiment in a disposable Docker container. The container runner can limit CPU, memory, and processes, and shift the wall clock. A local model can choose a bounded sequence of experiments and propose a small source insertion. Wobble verifies each candidate patch in a disposable copy. See [the architecture](docs/architecture.md) for the build order.

## Install

Use Python 3.11 or newer. Install from this directory:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -e .
```

The install needs access to pytest. If the repository under test has other dependencies, install them in the same environment before the hunt.

## Run the demo

```sh
.venv/bin/wobble hunt examples/order_dependent --runs 20 --seed 0 --minimize --output reports/demo.json
```

To try another repository, pass its directory in place of `examples/order_dependent`. Use `--select` to narrow collection to a test path or pytest node ID relative to that repository.

The sample has a polluter that writes to module state, a victim that expects clean state, and a cleanup test. Some orders pass. Other orders fail. Wobble should identify the victim as observed flaky and reduce a failing prefix to the polluter.

## Run in Docker

Build the runner image once:

```sh
docker build -f Dockerfile.runner -t wobble-pytest:py311 .
```

Then run the same hunt with container isolation:

```sh
.venv/bin/wobble hunt examples/order_dependent --runner docker --runs 20 --seed 0 --minimize
```

To test time or CPU behavior, use a fixed profile for each hunt. The JSON report records the profile for every run.

```sh
.venv/bin/wobble hunt examples/order_dependent --runner docker --runs 20 --seed 0 \
  --cpus 0.5 --memory-mb 256 --clock-shift-seconds 3600 \
  --output reports/shifted.json
```

The image must contain pytest and the target project's dependencies. Build a derived image and pass its name with `--image` when a project needs more packages. The runner mounts the target repository read only and does not pass the host environment into the container. It disables network access and gives each run a new container. The result directory is the only writable host mount. Docker isolation reduces risk, but it is not a guarantee that arbitrary hostile code is safe.

The clock shift uses `libfaketime`. Some programs bypass its time hooks, so confirm a time-sensitive failure with a targeted test. The offset changes wall clock readings; monotonic time stays real. `--timeout` limits the total container run and removes a timed-out container.

## Let a local model investigate

Install [Ollama](https://ollama.com/) and download an open-weight model. The default model is Qwen3 4B Instruct:

```sh
ollama pull qwen3:4b-instruct
.venv/bin/wobble hunt examples/order_dependent --runner docker --runs 20 \
  --seed 0 --agent --model qwen3:4b-instruct --output reports/agent.json
```

The model sees a short failure log, the ends of a passing and failing order, and a few test functions. It must choose from `run_isolated`, `run_before_victim`, `minimize_order`, `shift_clock`, and `finish`. The clock action adds one hour to the current profile. Every experiment is run by Wobble and written to the JSON evidence. Invalid actions are rejected and retried up to three times. Wobble checks whether the experiments support the model's proposed cause. An unsupported cause is reported as unknown. A supported diagnosis is still a **hypothesis**, not a verified fix. Small models may use the step budget without a useful diagnosis.

## Verify a patch

Start with a hunt that saved a minimized reproducer. Then give Wobble a unified diff:

```sh
.venv/bin/wobble hunt examples/order_dependent --runner docker --runs 20 \
  --seed 0 --minimize --output reports/demo.json
.venv/bin/wobble verify examples/order_dependent \
  --patch examples/patches/clear_cache.diff --evidence reports/demo.json \
  --runs 100 --output reports/verification.json
```

The verifier copies the repository. It checks that the patch applies, collected tests remain, the victim test function stays unchanged, and existing assertion expressions remain in the source. It confirms the old reproducer fails before the patch and passes after the patch. It then runs the full patched suite in 100 shuffled orders under the conditions saved by the hunt. It stops and reports failure on the first nonpassing run. The original repository is not patched.

The assertion check is a basic guard. It cannot prove that a patch preserves every test's meaning. Even 100 passing runs do not prove the failure rate is zero.

## Ask a model to repair

Use a hunt report with a minimized reproducer. Wobble first tries a narrow deterministic repair. It then asks a local model to insert code into one test file from the reproducer. The model sees numbered source and the result of any rejected edit. Wobble checks Python syntax, applies the patch in a copy, runs a short screen, and then runs the full verification budget. The report includes both baseline and model outcomes.

```sh
.venv/bin/wobble repair examples/order_dependent \
  --evidence reports/demo.json --model qwen3:4b-instruct \
  --screen-runs 5 --verify-runs 100 \
  --output reports/repair.json --patch-output reports/model-fix.diff
```

`--patch-output` writes a model patch only after final verification. The baseline handles one simple pattern: a test writes to a module-level dictionary that the victim reads. It does not try to repair other causes. The three-case model check found three verified repairs from Qwen3 4B Instruct and none from the previous Qwen2.5 Coder 7B installation. A separate environment-variable case also passed 100 Docker reruns. These small results do not establish general repair quality.

The [model selection check](docs/model-selection.md) runs three fixed demo cases under the same Docker verification budget.

To run only the baseline while testing a local model setup:

```sh
.venv/bin/wobble repair examples/order_dependent \
  --evidence reports/demo.json --baseline-only --verify-runs 100 \
  --output reports/baseline.json
```

The failure rate is the fraction of observed runs that failed. The confidence interval describes sampling uncertainty. A zero failure count does not prove a test is stable. The minimizer returns a **1-minimal** prefix: removing any one remaining test stops the reproduced failure. It does not promise the shortest possible prefix.

## Run checks

```sh
.venv/bin/python -m pytest -q tests
```
