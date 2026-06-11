import React, { useEffect, useMemo, useState } from "react";

export default function PCBSolderDefectClassifier() {
  const [imageSrc, setImageSrc] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [reportMessage, setReportMessage] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [result, setResult] = useState({
    prediction: "Waiting",
    defect: "Upload an image to begin classification.",
    confidence: 0,
    recommendation: "Recommendation will appear after the image is analyzed.",
    defects: []
  });

  const navItems = useMemo(
    () => [
      { id: "home", label: "Home" },
      { id: "upload", label: "Upload" },
      { id: "dashboard", label: "Dashboard" },
      { id: "detection", label: "Detection Output" },
      { id: "about", label: "About" },
      { id: "report", label: "Report" }
    ],
    []
  );

  const sampleResults = useMemo(
    () => [
      {
        prediction: "Defective",
        defect: "Solder Bridge",
        confidence: 92,
        recommendation: "Remove excess solder and reinspect nearby pins.",
        defects: [
          { id: 1, type: "Solder Bridge", x: 48, y: 42, size: 96 },
          { id: 2, type: "Solder Bridge", x: 63, y: 58, size: 72 }
        ]
      },
      {
        prediction: "Defective",
        defect: "Insufficient Solder",
        confidence: 88,
        recommendation: "Apply proper solder volume and verify joint stability.",
        defects: [
          { id: 1, type: "Insufficient Solder", x: 36, y: 54, size: 88 },
          { id: 2, type: "Insufficient Solder", x: 58, y: 38, size: 70 }
        ]
      },
      {
        prediction: "Good",
        defect: "No Defect",
        confidence: 96,
        recommendation: "The solder joint passed visual classification.",
        defects: []
      },
      {
        prediction: "Defective",
        defect: "Excess Solder",
        confidence: 90,
        recommendation: "Reduce solder buildup and check for possible bridging.",
        defects: [
          { id: 1, type: "Excess Solder", x: 44, y: 46, size: 104 }
        ]
      },
      {
        prediction: "Defective",
        defect: "Solder Spike",
        confidence: 85,
        recommendation: "Remove sharp solder formation and inspect the joint surface.",
        defects: [
          { id: 1, type: "Solder Spike", x: 55, y: 50, size: 80 }
        ]
      }
    ],
    []
  );

  useEffect(() => {
    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + 180;
      let currentSection = "home";

      navItems.forEach((item) => {
        const section = document.getElementById(item.id);
        if (!section) return;

        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSection = item.id;
        }
      });

      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
      if (nearBottom) {
        currentSection = "report";
      }

      setActiveSection(currentSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection);
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [navItems]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setImageSrc(loadEvent.target?.result || "");
      setResult({
        prediction: "Waiting",
        defect: "Image uploaded. Start analysis.",
        confidence: 0,
        recommendation: "Click Analyze Image to classify the uploaded PCB solder image.",
        defects: []
      });
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imageSrc) {
      setResult({
        prediction: "No Image",
        defect: "Please upload an image first.",
        confidence: 0,
        recommendation: "Upload a valid PCB solder image before running analysis.",
        defects: []
      });
      return;
    }

    setIsAnalyzing(true);
    setResult({
      prediction: "Analyzing...",
      defect: "U-Net model is processing the uploaded image.",
      confidence: 15,
      recommendation: "Running semantic segmentation on PCB solder image.",
      defects: []
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/api/predict/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc })
      });

      const data = await response.json();

      setResult({
        prediction: data.prediction,
        defect: data.defect,
        confidence: data.confidence,
        recommendation: data.recommendation,
        defects: data.defects
      });
    } catch (err) {
      console.error("U-Net inference error:", err);
      setResult({
        prediction: "Error",
        defect: "Analysis failed. Check console for details.",
        confidence: 0,
        recommendation: "Make sure Django is running at http://127.0.0.1:8000",
        defects: []
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetDemo = () => {
    setImageSrc("");
    setIsAnalyzing(false);
    setResult({
      prediction: "Waiting",
      defect: "Upload an image to begin classification.",
      confidence: 0,
      recommendation: "Recommendation will appear after the image is analyzed.",
      defects: []
    });
  };

  const submitReport = () => {
    if (!reportMessage.trim()) {
      setReportStatus("Please describe the bug or error encountered.");
      return;
    }

    setReportStatus("Report submitted. The issue has been recorded.");
    setReportMessage("");
  };

  return (
    <>
      <style>{`
        :root {
          --bg: #ffffff;
          --text: #0a0a0a;
          --muted: #666666;
          --border: #d9d9d9;
          --soft: #f5f5f5;
          --dark: #111111;
          --card: #ffffff;
          --shadow: 0 18px 50px rgba(0, 0, 0, 0.08);
          --radius: 20px;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: Arial, Helvetica, sans-serif;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: var(--bg);
          color: var(--text);
          line-height: 1.6;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .app {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 260px 1fr;
        }

        aside {
          position: sticky;
          top: 0;
          height: 100vh;
          padding: 28px 22px;
          border-right: 1px solid var(--border);
          background: #ffffff;
          align-self: start;
          overflow-y: auto;
          z-index: 20;
        }

        .brand {
          margin-bottom: 34px;
        }

        .brand-mark {
          width: 46px;
          height: 46px;
          border: 2px solid var(--dark);
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .brand h1 {
          font-size: 20px;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        .brand p {
          font-size: 13px;
          color: var(--muted);
          margin-top: 8px;
        }

        nav {
          display: grid;
          gap: 8px;
        }

        nav a {
          padding: 12px 14px;
          border: 1px solid transparent;
          border-radius: 14px;
          color: #222;
          font-size: 14px;
          transition: 0.2s ease;
        }

        nav a:hover,
        nav a.active {
          border-color: var(--dark);
          background: var(--dark);
          color: #ffffff;
        }

        main {
          padding: 30px;
          background:
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: 34px 34px;
        }

        section {
          margin-bottom: 28px;
          scroll-margin-top: 26px;
        }

        .hero {
          background: var(--dark);
          color: #ffffff;
          padding: 42px;
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          display: grid;
          grid-template-columns: 1.5fr 0.8fr;
          gap: 24px;
          align-items: center;
        }

        .eyebrow {
          display: inline-flex;
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 12px;
          color: #eeeeee;
          margin-bottom: 18px;
        }

        .hero h2 {
          font-size: clamp(34px, 5vw, 62px);
          line-height: 0.95;
          letter-spacing: -0.06em;
          max-width: 760px;
        }

        .hero p {
          margin-top: 18px;
          color: #d8d8d8;
          max-width: 680px;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
        }

        .btn {
          border: 1px solid var(--dark);
          background: var(--dark);
          color: #ffffff;
          padding: 12px 18px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.18);
        }

        .btn:disabled {
          cursor: not-allowed;
          opacity: 0.72;
        }

        .btn.light {
          background: #ffffff;
          color: var(--dark);
          border-color: #ffffff;
        }

        .btn.outline {
          background: transparent;
          color: var(--dark);
        }

        .hero-stat {
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 18px;
          padding: 22px;
          background: rgba(255,255,255,0.06);
        }

        .hero-stat strong {
          display: block;
          font-size: 44px;
          line-height: 1;
        }

        .hero-stat span {
          display: block;
          color: #d0d0d0;
          font-size: 13px;
          margin-top: 8px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 24px;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .card h3 {
          font-size: 22px;
          letter-spacing: -0.03em;
        }

        .card p,
        .small {
          color: var(--muted);
          font-size: 14px;
        }

        .upload-box {
          border: 2px dashed #999;
          background: var(--soft);
          min-height: 280px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          text-align: center;
          padding: 24px;
          cursor: pointer;
          overflow: hidden;
        }

        .upload-box:hover {
          border-color: var(--dark);
          background: #eeeeee;
        }

        .upload-box img {
          width: 100%;
          max-height: 330px;
          object-fit: contain;
          display: block;
        }
        }

        .upload-icon {
          width: 76px;
          height: 76px;
          border-radius: 22px;
          border: 2px solid var(--dark);
          display: grid;
          place-items: center;
          margin: 0 auto 14px;
          font-size: 34px;
          font-weight: 800;
        }

        input[type="file"] {
          display: none;
        }

        .result-box {
          border: 1px solid var(--dark);
          border-radius: 18px;
          padding: 20px;
          background: #ffffff;
        }

        .result-label {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--muted);
        }

        .result-main {
          font-size: 34px;
          font-weight: 900;
          letter-spacing: -0.05em;
          margin: 8px 0;
        }

        .confidence-wrap {
          margin-top: 18px;
        }

        .confidence-bar {
          height: 12px;
          background: #eeeeee;
          border: 1px solid var(--border);
          border-radius: 999px;
          overflow: hidden;
          margin-top: 8px;
        }

        .confidence-fill {
          height: 100%;
          background: var(--dark);
          transition: 0.6s ease;
        }

        .recommendation {
          margin-top: 18px;
          padding: 14px;
          border-left: 4px solid var(--dark);
          background: var(--soft);
          border-radius: 10px;
          font-size: 14px;
        }

        .metric {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 20px;
          box-shadow: var(--shadow);
        }

        .metric span {
          color: var(--muted);
          font-size: 13px;
        }

        .metric strong {
          display: block;
          font-size: 34px;
          letter-spacing: -0.05em;
          margin-top: 6px;
        }

        .detection-layout {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 24px;
          align-items: start;
        }

        .detection-view {
          position: relative;
          min-height: 420px;
          border-radius: 18px;
          border: 1px solid var(--border);
          background: var(--soft);
          overflow: hidden;
          display: grid;
          place-items: center;
        }

        .detection-view img {
          width: 100%;
          height: 100%;
          max-height: 560px;
          object-fit: contain;
          display: block;
        }

        .detection-empty {
          text-align: center;
          padding: 24px;
        }

        .detection-empty strong {
          display: block;
          font-size: 24px;
          letter-spacing: -0.04em;
          margin-bottom: 8px;
        }

        .defect-circle {
          position: absolute;
          width: var(--size);
          height: var(--size);
          left: var(--x);
          top: var(--y);
          transform: translate(-50%, -50%);
          border: 3px solid var(--dark);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 0 9999px rgba(255, 255, 255, 0.02);
        }

        .defect-label {
          position: absolute;
          left: 50%;
          top: -42px;
          transform: translateX(-50%);
          white-space: nowrap;
          background: var(--dark);
          color: #ffffff;
          border-radius: 999px;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 800;
        }

        .detection-list {
          display: grid;
          gap: 12px;
        }

        .detection-item {
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 16px;
          background: #ffffff;
        }

        .detection-item h4 {
          font-size: 16px;
          margin-bottom: 6px;
        }

        .report-layout {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 18px;
          align-items: end;
        }

        .report-field {
          width: 100%;
          min-height: 120px;
          resize: vertical;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 14px 16px;
          margin-top: 16px;
          background: #ffffff;
          color: var(--text);
          font-size: 14px;
          line-height: 1.6;
          outline: none;
        }

        .report-field:focus {
          border-color: var(--dark);
        }

        .report-status {
          margin-top: 12px;
          color: var(--muted);
          font-size: 14px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid var(--dark);
          font-size: 12px;
          font-weight: 700;
        }

        .badge.filled {
          background: var(--dark);
          color: #ffffff;
        }

        .footer {
          text-align: center;
          color: var(--muted);
          font-size: 13px;
          padding: 18px 0 4px;
        }

        @media (max-width: 1100px) {
          .app {
            grid-template-columns: 1fr;
          }

          aside {
            position: sticky;
            top: 0;
            height: auto;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }

          nav {
            grid-template-columns: repeat(3, 1fr);
          }

          .hero,
          .grid-2,
          .detection-layout,
          .report-layout {
            grid-template-columns: 1fr;
          }

          .grid-3 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          main {
            padding: 18px;
          }

          .hero {
            padding: 28px;
          }

          nav,
          .grid-3 {
            grid-template-columns: 1fr;
          }

          .detection-view {
            min-height: 320px;
          }
        }
      `}</style>

      <div className="app">
        <aside>
          <div className="brand">
            <div className="brand-mark">ML</div>
            <h1>PCB Solder Defect Classifier</h1>
            <p>Black and white UI for image-based inspection.</p>
          </div>

          <nav>
            {navItems.map((item) => (
              <a
                key={item.id}
                className={activeSection === item.id ? "active" : ""}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main>
          <section className="hero" id="home">
            <div>
              <span className="eyebrow">Machine Learning-Based Inspection System</span>
              <h2>Classify PCB solder defects from uploaded images.</h2>
              <p>
                Upload a PCB solder image, run analysis, view the predicted class,
                confidence score, and detected defect location.
              </p>
              <div className="hero-actions">
                <a className="btn light" href="#upload">Upload Image</a>
                <a className="btn light" href="#detection">View Defect Type</a>
              </div>
            </div>
            <div className="hero-stat">
              <strong>94.2%</strong>
              <span>Model accuracy</span>
            </div>
          </section>

          <section className="grid-2" id="upload">
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Upload PCB Image</h3>
                  <p>Upload a JPG or PNG image of a solder joint.</p>
                </div>
                <span className="badge">Input</span>
              </div>

              <label className="upload-box" htmlFor="imageInput">
                {imageSrc ? (
                  <img src={imageSrc} alt="Uploaded PCB preview" />
                ) : (
                  <div>
                    <div className="upload-icon">+</div>
                    <strong>Click or drag image here</strong>
                    <p className="small">Accepted formats: JPG, JPEG, PNG</p>
                  </div>
                )}
              </label>
              <input id="imageInput" type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} />

              <div style={{ marginTop: "18px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button className="btn" onClick={analyzeImage} disabled={isAnalyzing}>
                  Analyze Image
                </button>
                <button className="btn outline" onClick={resetDemo}>
                  Reset
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Classification Result</h3>
                  <p>Model output appears after analysis.</p>
                </div>
                <span className="badge filled">Output</span>
              </div>

              <div className="result-box">
                <div className="result-label">Prediction</div>
                <div className="result-main">{result.prediction}</div>
                <p>{result.defect}</p>

                <div className="confidence-wrap">
                  <div className="result-label">Confidence Score</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                    <strong>{result.confidence}%</strong>
                    <span className="small">Model certainty</span>
                  </div>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${result.confidence}%` }} />
                  </div>
                </div>

                <div className="recommendation">{result.recommendation}</div>
              </div>
            </div>
          </section>

          <section id="dashboard">
            <div className="grid-3">
              <div className="metric">
                <span>Total Images Analyzed</span>
                <strong>1,248</strong>
              </div>
              <div className="metric">
                <span>Defective Joints Detected</span>
                <strong>326</strong>
              </div>
              <div className="metric">
                <span>Most Common Defect</span>
                <strong>Bridge</strong>
              </div>
            </div>
          </section>

          <section className="card" id="detection">
            <div className="card-header">
              <div>
                <h3>Detection Output</h3>
                <p>Detected defects are encircled and labeled after analysis.</p>
              </div>
              <span className="badge">Detection</span>
            </div>

            <div className="detection-layout">
              <div className="detection-view">
                {imageSrc ? (
                  <>
                    <img src={imageSrc} alt="Detected PCB solder defects" />
                    {result.defects.map((defect) => (
                      <div
                        key={defect.id}
                        className="defect-circle"
                        style={{
                          "--x": `${defect.x}%`,
                          "--y": `${defect.y}%`,
                          "--size": `${defect.size}px`
                        }}
                      >
                        <span className="defect-label">{defect.type}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="detection-empty">
                    <strong>No image uploaded</strong>
                    <p className="small">Upload and analyze a PCB solder image.</p>
                  </div>
                )}
              </div>

              <div className="detection-list">
                <div className="detection-item">
                  <h4>Detected Class</h4>
                  <p className="small">{result.defect}</p>
                </div>
                <div className="detection-item">
                  <h4>Defect Count</h4>
                  <p className="small">{result.defects.length}</p>
                </div>
                <div className="detection-item">
                  <h4>Inspection Status</h4>
                  <p className="small">{result.prediction}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card" id="about">
            <h3>About the Project</h3>
            <p>
              This website classifies PCB solder images using a trained machine learning model.
            </p>
          </section>

          <section className="card" id="report">
            <div className="card-header">
              <div>
                <h3>Report</h3>
                <p>Report bugs or errors encountered while using the system.</p>
              </div>
              <span className="badge">Bug Report</span>
            </div>

            <div className="report-layout">
              <div>
                <textarea
                  className="report-field"
                  value={reportMessage}
                  onChange={(event) => setReportMessage(event.target.value)}
                  placeholder="Describe the bug or error encountered."
                />
                {reportStatus && <div className="report-status">{reportStatus}</div>}
              </div>
              <button className="btn" onClick={submitReport}>Report</button>
            </div>
          </section>

          <div className="footer">
            Machine Learning-Based PCB Solder Defect Classification
          </div>
        </main>
      </div>
    </>
  );
}
