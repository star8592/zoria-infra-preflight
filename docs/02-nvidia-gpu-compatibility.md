# NVIDIA GPU environment troubleshooting without guesswork

CUDA and PyTorch errors can stem from incompatible package versions, driver/runtime mismatches, unavailable devices or a workload issue. A GPU seen by nvidia-smi does **not** mean that a particular ML workload will run correctly.

## Read-only baseline

```bash
nvidia-smi --query-gpu=index,name,driver_version,memory.total,utilization.gpu --format=csv,noheader,nounits
```

Record the host Linux version, GPU model, driver, CUDA runtime/toolkit and Python/PyTorch package versions in a version matrix. Ask for a minimal reproducible error and expected result. Confirm access to a permitted test GPU and who pays for rented compute.

## Procedure

1. Reproduce the error and save sanitized logs.
2. Check driver support for the target CUDA runtime, then package compatibility.
3. Choose the smallest reversible correction. Do not replace production drivers without a backup and maintenance window.
4. Execute the client-authorized smoke test.
5. Record before/after behavior and exact dependency versions.

**No invented speedups.** GPU utilization, memory size and driver version are inventory evidence, not a performance benchmark. Commercial proposals must distinguish environment repair from custom model development.
