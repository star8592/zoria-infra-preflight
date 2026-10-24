use std::{fmt::Write, fs, process::Command};
fn value(s: &str, key: &str) -> Option<u64> {
    s.lines().find_map(|l| {
        let (k, v) = l.split_once(':')?;
        if k == key {
            v.split_whitespace().next()?.parse().ok()
        } else {
            None
        }
    })
}
fn clean(s: &str) -> String {
    s.chars()
        .filter(|c| c.is_ascii_alphanumeric() || " .-_+()/".contains(*c))
        .take(90)
        .collect()
}
fn ver(cmd: &str, args: &[&str]) -> String {
    match Command::new(cmd).args(args).output() {
        Ok(o) if o.status.success() => clean(
            String::from_utf8_lossy(&o.stdout)
                .lines()
                .next()
                .unwrap_or("unknown"),
        ),
        _ => "unavailable".into(),
    }
}
fn linux() -> String {
    let mut o =
        String::from("# Linux Read-only Preflight\n\nNo changes, secrets or network collection.\n");
    if let Ok(t) = fs::read_to_string("/proc/loadavg") {
        let v: Vec<_> = t.split_whitespace().take(3).collect();
        if v.len() == 3 {
            let _ = writeln!(o, "- Load 1/5/15m: {} / {} / {}", v[0], v[1], v[2]);
        }
    }
    if let Ok(t) = fs::read_to_string("/proc/meminfo") {
        if let (Some(a), Some(b)) = (value(&t, "MemTotal"), value(&t, "MemAvailable")) {
            let _ = writeln!(
                o,
                "- RAM total {:.1} GiB, available {:.1} GiB",
                a as f64 / 1048576.,
                b as f64 / 1048576.
            );
        }
    }
    o.push_str("\nNext: inspect client-authorized service logs and define objective issue. Metrics alone do not establish root cause.\n");
    o
}
fn rows(s: &str) -> Vec<Vec<String>> {
    s.lines()
        .filter_map(|l| {
            let v: Vec<_> = l.split(',').map(|x| clean(x.trim())).collect();
            (v.len() == 5 && v.iter().all(|x| !x.is_empty())).then_some(v)
        })
        .collect()
}
fn gpu() -> String {
    let mut o =
        String::from("# NVIDIA GPU Read-only Preflight\n\nNo driver, CUDA or workload changes.\n");
    match Command::new("nvidia-smi")
        .args([
            "--query-gpu=index,name,driver_version,memory.total,utilization.gpu",
            "--format=csv,noheader,nounits",
        ])
        .output()
    {
        Ok(r) if r.status.success() => {
            let v = rows(&String::from_utf8_lossy(&r.stdout));
            if v.is_empty() {
                o.push_str("- No parsable GPUs found.\n")
            } else {
                o.push_str("| Index | Model | Driver | Memory MiB | Utilization % |\n|---|---|---|---:|---:|\n");
                for a in v {
                    let _ = writeln!(
                        o,
                        "| {} | {} | {} | {} | {} |",
                        a[0], a[1], a[2], a[3], a[4]
                    );
                }
            }
        }
        _ => o.push_str("- nvidia-smi unavailable; GPU unverified.\n"),
    }
    o.push_str("\nNext: verify actual framework versions and reproduce failure. This is NOT an AI performance benchmark.\n");
    o
}
fn ai() -> String {
    let mut o =
        String::from("# AI Deployment Tool Preflight\n\nNo installation or model execution.\n");
    for (n, p, a) in [
        ("Python", "python3", vec!["--version"]),
        ("FFmpeg", "ffmpeg", vec!["-version"]),
        ("Rust", "rustc", vec!["--version"]),
    ] {
        let _ = writeln!(o, "- {}: {}", n, ver(p, &a));
    }
    o.push_str("\nNext: verify licensed application, model/input rights, smoke test and rollback. Tools present do NOT prove deployment.\n");
    o
}
fn main() {
    match std::env::args().nth(1).unwrap_or_default().as_str() {
        "linux" => print!("{}", linux()),
        "gpu" => print!("{}", gpu()),
        "ai" => print!("{}", ai()),
        "all" => print!("{}\n{}\n{}", linux(), gpu(), ai()),
        _ => {
            eprintln!("Usage: zoria-preflight linux|gpu|ai|all");
            std::process::exit(2)
        }
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn m() {
        assert_eq!(value("MemTotal: 4000 kB", "MemTotal"), Some(4000));
    }
    #[test]
    fn invalid() {
        assert_eq!(value("MemTotal: invalid", "MemTotal"), None);
    }
    #[test]
    fn g() {
        assert_eq!(rows("0, GPU Model, 555.1, 16000, 50\nbad").len(), 1);
    }
    #[test]
    fn sanitize() {
        assert_eq!(clean("abc;token=xx"), "abctokenxx");
    }
}
