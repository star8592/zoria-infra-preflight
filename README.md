# Zoria Infra Preflight — Read-only Rust Infrastructure Checks

A small **zero-dependency Rust CLI** that demonstrates our process for safely inspecting Linux, NVIDIA GPU, and AI deployment prerequisites. Designed for educational use, technical consulting evidence, and reproducible local diagnostics.

The program does not change drivers, install packages, scan networks, access customer data, or collect credentials. It also never performs Upwork automation.

## Quick start

```bash
rustc --edition=2021 -O src/main.rs -o zoria-preflight
./zoria-preflight linux
./zoria-preflight gpu
./zoria-preflight ai
```

With Cargo (also no external crates): `cargo test` and `cargo run -- all`.

## What is actually tested?

- `linux`: load averages and physical memory using Linux /proc metrics.
- `gpu`: index, GPU model, driver version, memory and utilization from an explicit read-only nvidia-smi query. If absent, says unavailable.
- `ai`: installed tool versions for Python, FFmpeg and Rust. **This is not proof that an AI model has been deployed.**

The output has no hostname, usernames, IP addresses, GPU UUIDs, filesystem paths, cookies or API tokens. Sanitize all output again before making public. Use only on machines you own or have explicit authorization to inspect.

## Evidence versus marketing

A preflight demonstrates our **method of assessment**, not a guarantee that a customer's unknown issue can be resolved. A complete paid engagement adds scope, logs, approved remediation, rollback plan, testing, and a client-verifiable handover. Historical employer projects must never be presented as this repository's software, screenshots or prior Upwork contracts.

## Scope and limitations

Linux with /proc is required for Linux metrics. NVIDIA GPU support requires nvidia-smi and a functioning driver. Parsing is intentionally conservative. Numeric metrics are only snapshots and are not benchmark results.

## Consulting

Profile: https://www.upwork.com/freelancers/~013b7a3a7443455b22

Contact and contracting through Upwork when the client originated there; adhere to all platform rules.

## License

MIT; see LICENSE.
