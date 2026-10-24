(function () {
 "use strict";
 const form = document.getElementById("brief-form");
 if (!form || !globalThis.ZoriaBrief) return;
 const status = document.getElementById("brief-status");
 const result = document.getElementById("brief-result");
 const output = document.getElementById("brief-output");
 const copy = document.getElementById("copy-brief");
 const service = document.getElementById("service");
 const choices = document.querySelectorAll("[data-select-service]");
 const qs = new URLSearchParams(location.search);
 const preset = qs.get("service");
 if (Object.prototype.hasOwnProperty.call(ZoriaBrief.SERVICES, preset)) service.value = preset;
 const renderOptions = () => {
   for (const button of choices) {
     const selected = button.dataset.selectService === service.value;
     button.setAttribute("aria-pressed", selected ? "true" : "false");
   }
 };
 for (const button of choices) button.addEventListener("click", () => {
   service.value = button.dataset.selectService;
   renderOptions();
 });
 renderOptions();
 form.addEventListener("submit", event => {
   event.preventDefault();
   try {
     const brief = ZoriaBrief.buildBrief({
       service: service.value,
       problem: form.elements.namedItem("problem").value,
       environment: form.elements.namedItem("environment").value,
       outcome: form.elements.namedItem("outcome").value,
       constraints: form.elements.namedItem("constraints").value
     });
     output.value = brief;
     result.hidden = false;
     status.textContent = "Brief prepared locally. Review and copy it before contacting the engineer on Upwork.";
     status.dataset.state = "success";
     result.scrollIntoView({ behavior: "smooth", block: "start" });
   } catch (error) {
     status.textContent = error.message;
     status.dataset.state = "error";
     result.hidden = true;
   }
 });
 copy.addEventListener("click", async () => {
   if (!output.value) return;
   try {
     if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard API unavailable");
     await navigator.clipboard.writeText(output.value);
     status.textContent = "Copied. Open Upwork and paste this brief into your inquiry.";
     status.dataset.state = "success";
   } catch {
     output.focus();
     output.select();
     status.textContent = "Select and copy the highlighted text manually (Ctrl/Cmd+C).";
     status.dataset.state = "info";
   }
 });
})();
