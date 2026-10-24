# Wobble

Wobble is a local tool that hunts order-dependent pytest failures. It runs a test suite in shuffled orders, reports an observed failure rate with a 95% Wilson interval, and reduces a failing order to a small set of earlier tests.

The first version is a CLI. It can run a trusted repository in fresh Python processes or run each experiment in a disposable Docker container. The container runner can limit CPU, memory, and processes, and shift the wall clock. A local model can choose a bounded sequence of experiments and propose a small source insertion. Wobble verifies each candidate patch in a disposable copy. See [the architecture](docs/architecture.md) for the build order.

## Install

Use Python 3.11 or newer. Run these commands from the Wobble project directory. If `.venv` already exists and Wobble is installed, skip the first two commands.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -e .
.venv/bin/wobble --help
```

The install needs access to pytest. If the target repository has other dependencies, install them in the same environment before a local hunt. For Docker runs, put those dependencies in the runner image instead. The commands below use paths relative to this project directory.

### Install Wobble as a Python package

Install Wobble in the **target project's Python environment**. The local runner uses that environment to run pytest, so the target's dependencies must be installed there too. The package is not yet published on PyPI. Install it from a Wobble checkout or from a wheel:

```sh
# Run this with the target project's Python interpreter.
python -m pip install "/path/to/Wobble"
python -m wobble --help
```

To install a wheel, use `python -m pip install /path/to/wobble-0.1.0-py3-none-any.whl` instead. `pip install` installs Wobble and its Python dependency, pytest. It does not install Ollama or download model weights. Install and start [Ollama](https://ollama.com/download) separately. Then run:

```sh
python -m wobble setup
python -m wobble hunt /path/to/target-project --runs 20 --minimize --output hunt.json
```

`wobble setup` checks for the default `qwen3:4b-instruct` model. It skips the download when the model is already installed. If the model is missing, it asks before downloading. Use `wobble setup --yes` only when you want to approve that download without a prompt. Use `wobble doctor --check-inference` to check that the model can answer a short structured request. A plain hunt and `verify` do not need Ollama.

The examples below use `.venv/bin/wobble` from this checkout. In an installed environment, run its `wobble` command instead. The `examples/` folders are part of the source checkout, not the installed wheel.

## Quick start with the included tests

First, find a flaky test and save a minimized reproducer:

```sh
.venv/bin/wobble hunt examples/order_dependent \
  --runs 20 --seed 0 --minimize --output reports/demo.json
```

The command should report `test_b_victim` as observed flaky. It should identify `test_a_polluter` as the earlier test needed to make it fail. The output file records every order and outcome. To try another project, replace `examples/order_dependent` with the path to its test repository. Use `--select` to narrow the test set.

To let the installed local Qwen3 model propose a fix, confirm that Ollama is running and lists `qwen3:4b-instruct`:

```sh
ollama list
.venv/bin/wobble repair examples/order_dependent \
  --evidence reports/demo.json --model qwen3:4b-instruct \
  --output reports/repair.json --patch-output reports/model-fix.diff
```

`repair` tests each candidate in a disposable copy. It writes `reports/model-fix.diff` only when the model patch passes final verification. It does not apply that patch to the target folder. The local runner executes target tests in place, so use it only with code you trust.

## Run in Docker

Build the runner image once:

```sh
docker build -f Dockerfile.runner -t wobble-pytest:py311 .
```

After installing the wheel, export the same recipe and build the image only when you choose to use Docker:

```sh
wobble dockerfile --output runner.Dockerfile
docker build -f runner.Dockerfile -t wobble-pytest:py311 .
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

Start Ollama and use an installed open-weight model. The default model is Qwen3 4B Instruct. Check it with `wobble doctor`, or run `wobble setup` to install it with consent:

```sh
.venv/bin/wobble doctor
.venv/bin/wobble hunt examples/order_dependent --runner docker --runs 20 \
  --seed 0 --agent --model qwen3:4b-instruct --output reports/agent.json
```

The model sees a short failure log, the ends of a passing and failing order, and a few test functions. It must choose from `run_isolated`, `run_before_victim`, `minimize_order`, `shift_clock`, and `finish`. The clock action adds one hour to the current profile. Every experiment is run by Wobble and written to the JSON evidence. Invalid actions are rejected and retried up to three times. Wobble checks whether the experiments support the model's proposed cause. An unsupported cause is reported as unknown. A supported diagnosis is still a **hypothesis**, not a verified fix. Small models may use the step budget without a useful diagnosis.

Use either `--agent` or `--minimize` in one hunt. To repair from an agent report, the agent must have run `minimize_order`. The quick-start `--minimize` report always provides the required reproducer when minimization succeeds.

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

## Command reference

Run `.venv/bin/wobble --help` for the command list. Add `--help` to any command for its current syntax. You can also start the CLI with `.venv/bin/python -m wobble`.

### `wobble doctor`, `wobble setup`, and `wobble dockerfile`

`doctor` checks this Python environment, the Ollama server, and whether the selected model is installed. It never downloads a model. `setup` installs a missing local model only after consent and then checks structured inference. Both use the local Ollama server by default. Set `WOBBLE_OLLAMA_URL` or pass `--ollama-url URL` for a different server. A nonlocal server receives model requests and, during investigation and repair, relevant test source.

| Command and flag | Default | What it does |
| --- | --- | --- |
| `doctor --model NAME` | `qwen3:4b-instruct` | Check this model. |
| `doctor --ollama-url URL` | `http://127.0.0.1:11434` | Check this Ollama server. |
| `doctor --timeout SECONDS` | `180` | Limit each server request. |
| `doctor --check-inference` | off | Ask the installed model for a short structured reply. |
| `setup --model NAME` | `qwen3:4b-instruct` | Check or install this local model. |
| `setup --ollama-url URL` | `http://127.0.0.1:11434` | Use this Ollama server. |
| `setup --timeout SECONDS` | `180` | Limit each server request or stalled download read. |
| `setup --yes` | off | Approve a missing model download without an interactive prompt. |
| `dockerfile --output FILE` | required | Export the Docker runner recipe from the installed package. |
| `dockerfile --force` | off | Replace an existing output file. |

### `wobble hunt`

`hunt REPO [OPTIONS]` collects tests in `REPO`, runs shuffled orders, and prints a pass and failure summary for every collected test. `REPO` is a required local directory. The CLI investigates the first observed flaky test when you add `--minimize` or `--agent`.

| Flag | Default | What it does |
| --- | --- | --- |
| `--select PATH_OR_NODE_ID` | `.` | Collect only this pytest path or exact test ID, relative to `REPO`. |
| `--runs N` | `20` | Run N shuffled orders. N must be at least 2. |
| `--seed N` | `0` | Set the shuffle seed so the sequence of test orders can be repeated. |
| `--timeout SECONDS` | `120` | Limit each pytest invocation. |
| `--runner local\|docker` | `local` | Use fresh local Python processes or fresh Docker containers. |
| `--image NAME` | `wobble-pytest:py311` | Use this existing Docker image. It must contain pytest and the target dependencies. |
| `--cpus NUMBER` | `1.0` | Set the Docker CPU limit. |
| `--memory-mb N` | `512` | Set the Docker memory limit in MiB. |
| `--pids-limit N` | `64` | Set the Docker process limit. |
| `--clock-shift-seconds N` | `0` | Shift Docker wall-clock time by N seconds. A nonzero shift requires Docker. |
| `--minimize` | off | Replay a failed order and reduce the earlier tests to a 1-minimal reproducer. |
| `--agent` | off | Let the local model choose and run bounded follow-up experiments. Do not combine with `--minimize`. |
| `--agent-steps N` | `5` | Limit the model's experiment and finish decisions. Used with `--agent`. |
| `--model NAME` | `qwen3:4b-instruct` | Select an installed Ollama model for `--agent`. |
| `--ollama-url URL` | local server | Use this Ollama server for `--agent`. |
| `--model-timeout SECONDS` | `90` | Limit each model request during `--agent`. |
| `--replay-budget N` | `80` | Limit pytest replays during `--minimize`. |
| `--output FILE` | none | Save the full hunt evidence as JSON. |

Docker-only flags have no effect with `--runner local`, except a nonzero clock shift, which the CLI rejects. Docker runs use `--pull=never`; build or provide the named image before the hunt.

### `wobble verify`

`verify REPO --patch FILE --evidence FILE [OPTIONS]` checks a unified diff in a disposable copy of `REPO`. The evidence file must come from a hunt with a successfully minimized reproducer. Verification uses the runner conditions saved in that file. The original target file is not patched.

| Flag | Default | What it does |
| --- | --- | --- |
| `--patch FILE` | required | Read this unified diff and apply it to a temporary copy. |
| `--evidence FILE` | required | Read the victim, minimized earlier tests, seed, and run conditions from a hunt JSON file. |
| `--runs N` | `100` | Require N passing shuffled full-suite runs after the reproducer passes. |
| `--timeout SECONDS` | `120` | Limit each pytest invocation. |
| `--image NAME` | `wobble-pytest:py311` | Use this image when the evidence came from a Docker hunt. |
| `--output FILE` | none | Save the full verification result as JSON. |

### `wobble repair`

`repair REPO --evidence FILE [OPTIONS]` tries the narrow deterministic baseline and asks a local Ollama model for a cleanup insertion. It screens each candidate, then verifies passing candidates with the final run budget. It uses the runner conditions saved in the hunt evidence.

| Flag | Default | What it does |
| --- | --- | --- |
| `--evidence FILE` | required | Read a hunt JSON file with a successfully minimized reproducer. |
| `--model NAME` | `qwen3:4b-instruct` | Select an installed local Ollama model. |
| `--ollama-url URL` | local server | Use this Ollama server. |
| `--model-timeout SECONDS` | `180` | Limit each model request. |
| `--attempts N` | `2` | Limit model repair proposals. |
| `--screen-runs N` | `5` | Run this many shuffled full-suite checks before final verification. |
| `--verify-runs N` | `100` | Require this many shuffled full-suite runs for final verification. Set it to at least `--screen-runs`. |
| `--no-baseline` | off | Skip the deterministic baseline comparison. |
| `--baseline-only` | off | Run only the deterministic baseline, without Ollama. Do not combine with `--no-baseline`. |
| `--timeout SECONDS` | `120` | Limit each pytest invocation. |
| `--image NAME` | `wobble-pytest:py311` | Use this image when the evidence came from a Docker hunt. |
| `--output FILE` | none | Save candidate patches, feedback, and verification results as JSON. |
| `--patch-output FILE` | none | Save the model's diff only after that model patch passes final verification. |

### Model comparison script

The separate script `scripts/evaluate_models.py` runs three prepared cases in Docker and compares each named model with the deterministic baseline. It uses installed models and an existing runner image.

```sh
.venv/bin/python scripts/evaluate_models.py \
  --model qwen3:4b-instruct --output reports/model-benchmark.json
```

| Flag | Default | What it does |
| --- | --- | --- |
| `--model NAME` | required; repeatable | Evaluate one or more installed Ollama models. |
| `--hunt-runs N` | `20` | Use N shuffled hunt runs per case. |
| `--screen-runs N` | `5` | Use N screening runs per candidate. |
| `--verify-runs N` | `100` | Use N final verification runs per candidate. |
| `--output FILE` | `reports/model-benchmark.json` | Save the detailed comparison report. |

All commands accept `-h` or `--help`. Paths passed to `--output` are created as needed. The `reports/` directory is ignored by Git. A successful hunt exits with status 0 even when it finds no flaky test. Verification exits with status 0 only for a verified patch. Repair exits with status 0 for a verified model patch, or for a verified baseline when `--baseline-only` is set; other unverified outcomes exit with status 1. CLI or runner errors exit with status 2.
