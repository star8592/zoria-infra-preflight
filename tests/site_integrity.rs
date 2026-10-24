use std::fs;
use std::path::PathBuf;

fn docs() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("docs")
}
fn read(p: &str) -> String {
    fs::read_to_string(docs().join(p)).expect("page exists")
}
fn local_refs(html: &str, attr: &str) -> Vec<String> {
    html.split(&format!("{attr}=\""))
        .skip(1)
        .filter_map(|s| s.split('"').next())
        .filter(|s| !s.starts_with("https://") && !s.starts_with("http://") && !s.starts_with('#'))
        .map(str::to_string)
        .collect()
}
fn check_refs(page: &str) {
    let html = read(page);
    let dir = docs().join(page).parent().unwrap().to_path_buf();
    for href in local_refs(&html, "href")
        .into_iter()
        .chain(local_refs(&html, "src"))
    {
        assert!(
            dir.join(href.split('#').next().unwrap_or("")).exists(),
            "broken link {href} in {page}"
        );
    }
}
#[test]
fn service_pages_have_real_scopes_and_qa_metadata() {
    for (slug, title) in [
        ("linux", "Linux Server Troubleshooting"),
        ("gpu", "NVIDIA GPU, CUDA"),
        ("ai", "Reproducible AI"),
    ] {
        let page = format!("services/{slug}/index.html");
        let html = read(&page);
        for required in [
            title,
            "<meta name=\"description\"",
            "rel=\"canonical\"",
            "name=\"viewport\"",
            "application/ld+json",
            "upwork.com/freelancers",
            "not yet live Upwork Project Catalog listings",
        ] {
            assert!(html.contains(required), "missing {required} on {page}");
        }
        assert_eq!(html.matches("<details>").count(), 4);
        assert_eq!(html.matches("class=\"tier-row\"").count(), 3);
        assert_eq!(html.matches("class=\"step-item\"").count(), 4);
        assert!(html.contains("site-v2.css"));
        check_refs(&page);
    }
}
#[test]
fn homepage_links_to_each_service() {
    let html = read("index.html");
    for service in ["linux", "gpu", "ai"] {
        assert!(html.contains(&format!("services/{service}/")));
    }
    assert!(html.contains("rel=\"canonical\""));
    assert!(html.contains("Engineering you can"));
    assert!(html.contains("hero-inner"));
    check_refs("index.html");
}
#[test]
fn sitemap_robots_and_responsive_styles() {
    let xml = read("sitemap.xml");
    assert_eq!(xml.matches("<url>").count(), 4);
    for s in ["", "services/linux/", "services/gpu/", "services/ai/"] {
        assert!(xml.contains(&format!(
            "https://star8592.github.io/zoria-infra-preflight/{s}"
        )));
    }
    assert!(read("robots.txt")
        .contains("Sitemap: https://star8592.github.io/zoria-infra-preflight/sitemap.xml"));
    assert!(read("assets/site-v2.css").contains("@media(max-width:760px)"));
    assert!(read("assets/site-v2.css").contains("--gold:#f6bd66"));
    assert!(read("assets/site-v2.css").contains("--cyan:#6ccceb"));
}
#[test]
fn images_exist_and_no_fabricated_review_signals() {
    for slug in ["linux", "gpu", "ai"] {
        let p = docs().join(format!("assets/{slug}.png"));
        let size = fs::metadata(&p).unwrap().len();
        assert!((10_000..10_000_000).contains(&size));
    }
    for p in [
        "index.html",
        "services/linux/index.html",
        "services/gpu/index.html",
        "services/ai/index.html",
    ] {
        let html = read(p);
        assert!(!html.contains("AggregateRating") && !html.contains("100% guaranteed"));
    }
}
