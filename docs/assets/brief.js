(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && typeof root === "object") root.ZoriaBrief = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SERVICES = Object.freeze({
    linux: "Linux server diagnosis",
    gpu: "NVIDIA GPU / CUDA / PyTorch",
    ai: "AI workflow deployment"
  });

  function normalize(value, maxLength) {
    return String(value == null ? "" : value)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
      .replace(/\r\n?/g, "\n")
      .trim()
      .slice(0, maxLength);
  }

  function buildBrief(input) {
    const serviceKey = normalize(input.service, 20).toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(SERVICES, serviceKey))
      throw new Error("Choose a service before preparing your brief.");
    const problem = normalize(input.problem, 1800);
    const environment = normalize(input.environment, 900);
    const outcome = normalize(input.outcome, 900);
    const constraints = normalize(input.constraints, 900);
    if (problem.length < 12)
      throw new Error("Describe your problem in at least 12 characters.");
    if (environment.length < 5)
      throw new Error("Add the affected software or hardware environment.");
    if (outcome.length < 8)
      throw new Error("Describe what a successful result would look like.");

    return [
      "PROJECT BRIEF — " + SERVICES[serviceKey],
      "",
      "1. THE PROBLEM",
      problem,
      "",
      "2. ENVIRONMENT & VERSIONS",
      environment,
      "",
      "3. DESIRED RESULT / ACCEPTANCE TEST",
      outcome,
      "",
      "4. RESTRICTIONS & TIMING",
      constraints || "To be confirmed with the engineer.",
      "",
      "5. FIRST MILESTONE",
      "Please propose a scoped, evidence-led diagnostic or deployment milestone, including the expected deliverables, estimated timeline, change/rollback boundaries and fixed-price or hourly quote.",
      "",
      "NOTE",
      "No passwords, MFA codes, API tokens, confidential user records or proprietary customer data should be shared in ordinary chat. Secure access and compute expenses must be agreed separately.",
      "",
      "Prepared by the Zoria project brief tool. Nothing has been submitted automatically."
    ].join("\n");
  }

  return { SERVICES, buildBrief, normalize };
});
