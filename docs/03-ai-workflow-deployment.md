# Reproducible Linux AI deployment: define an acceptance test first

A successful AI installation is not simply "pip install worked." The client needs a repeatable sequence, a legal model/data path, and an objective test to establish useful behavior.

## Preflight questions

- What is the exact software repository and commit/version?
- Does its license permit the planned use?
- What Linux distribution, CPU, GPU, RAM, storage and network access are available?
- Are any sample audio, video, text or model weights authorized for this use?
- What is the smallest acceptable test, what constitutes success, and how will the service be rolled back?

## Delivery stages

1. Review hardware, dependencies, licenses and resource costs.
2. Agree on test input, output location, recovery scope and access.
3. Install in a controlled environment with documented versions. A Docker environment is not required.
4. Run the smoke test using authorized input and capture sanitized evidence.
5. Handover setup commands, service start/stop, known limitations and rollback steps.

The `ai` subcommand in this repository only checks availability of Python, FFmpeg and the Rust toolchain. **It does not deploy any model or assert model accuracy.** A professional service must perform a real workflow validation as a separate authorized engagement.
