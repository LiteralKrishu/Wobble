# Local model selection

Wobble needs a model that can choose experiments and propose a useful source edit. A model name alone does not show that it can do this work on this computer.

## Repair check

The current check uses three small pytest repositories:

| Case | Leak | Why it matters |
| --- | --- | --- |
| `order_dependent` | A test writes to a dictionary. | Checks the basic repair loop. |
| `order_with_assertion` | A test writes to a dictionary and checks its own result. | Cleanup must come after the polluter's assertion. |
| `order_with_list` | A test appends to a list. | Checks a second kind of shared state. |

Each case has a passing order and a failing order. Wobble first reduces a failing order to one polluter and one victim. It then gives the model the relevant test file, the minimized order, and the failing log. A candidate passes only when the original failure is reproduced, the patch keeps the tests and their assertions, and the patched full suite passes 100 shuffled runs in Docker.

Use the same command for each candidate model:

```sh
.venv/bin/python scripts/evaluate_models.py \
  --model qwen3:4b-instruct --verify-runs 100 \
  --output reports/qwen3-benchmark.json
```

This check measures repair on three prepared cases. It does not measure general repair quality. A passing patch may still leave other faults. The model must also pass the experiment-selection check before it becomes Wobble's default.

## Current results

| Candidate | Verified repairs | Status |
| --- | ---: | --- |
| Deterministic baseline | 1/3 | The dictionary case passed 100 Docker reruns. |
| Qwen2.5 Coder 7B | 0/3 | Its local installation was removed after the comparison. |
| Qwen3 4B Instruct | 3/3 | Each patch passed 100 Docker reruns. |

Qwen3 4B Instruct also repaired a separate environment-variable case on its first attempt. That patch passed 100 Docker reruns. In the model-guided investigation, it selected four experiments and reported shared state. Wobble accepted that cause because the victim passed alone and failed after the polluter.

Keep an older model until a replacement completes the check and gives better verified results. Remove an older local model only after that result is recorded. A three-case score is a demo gate, not proof that a model is perfect.
