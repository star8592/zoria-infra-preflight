# Linux incident triage: reproduce before you change

An infrastructure issue often looks simple in a ticket: "the site is down" or "the instance is slow." The first job is to establish what failed, when, and under which conditions.

## Safe starting point

1. Record the affected host, service, environment, approximate incident window and user impact.
2. Obtain client authorization before accessing anything and agree on log/data redaction.
3. Capture read-only baseline metrics, then focus on the affected service rather than changing many variables.
4. Separate a suspected cause from a confirmed, reproducible cause.
5. Propose the smallest reversible change, document approval, rollback and acceptance test.

Optional safe commands on an authorized Linux host:

```bash
cat /proc/loadavg
grep -E '^(MemTotal|MemAvailable):' /proc/meminfo
systemctl status nginx --no-pager
journalctl -u nginx --since '30 minutes ago' --no-pager
```

**Do not share raw logs**: they may contain internal addresses, tokens, account names or user requests. Redact before submitting a report.

Our Rust preflight demonstrates only the first two quantitative observations, not proof of remediation. The final deliverable should name the root cause confidence, evidence, approved changes, before/after verification and remaining risks.

**Service scope:** one named server problem; unlimited troubleshooting, emergency SLA and infrastructure rebuilds are not implied.
