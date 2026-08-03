"""
SignBridge AI - Deployment Verification Script.
Automated verification of Docker deployment, endpoints, and functionality.
"""
import sys
import time
import json
import subprocess
from typing import Dict, Any, Tuple
from dataclasses import dataclass

try:
    import requests
except ImportError:
    print("ERROR: 'requests' package required. Install with: pip install requests")
    sys.exit(1)


@dataclass
class CheckResult:
    name: str
    passed: bool
    message: str
    duration_ms: float = 0.0


class DeploymentVerifier:
    """Verify SignBridge AI deployment."""

    def __init__(self, ai_url: str = "http://localhost:8000", web_url: str = "http://localhost:3000"):
        self.ai_url = ai_url.rstrip("/")
        self.web_url = web_url.rstrip("/")
        self.results: list[CheckResult] = []

    def check(self, name: str, func) -> CheckResult:
        """Run a check and record the result."""
        start = time.time()
        try:
            passed, message = func()
            duration = (time.time() - start) * 1000
            result = CheckResult(name, passed, message, duration)
        except Exception as e:
            duration = (time.time() - start) * 1000
            result = CheckResult(name, False, str(e), duration)
        self.results.append(result)
        icon = "PASS" if result.passed else "FAIL"
        print(f"  [{icon}] {result.name}: {result.message} ({result.duration_ms:.0f}ms)")
        return result

    def verify_docker(self) -> Tuple[bool, str]:
        """Check if Docker containers are running."""
        try:
            output = subprocess.check_output(
                ["docker", "ps", "--format", "{{.Names}}"],
                text=True, timeout=10
            )
            containers = output.strip().split("\n")
            ai_running = any("signbridge-ai" in c for c in containers)
            web_running = any("signbridge-web" in c in containers)

            if ai_running and web_running:
                return True, "Both containers running"
            elif ai_running:
                return False, "AI container running, web missing"
            elif web_running:
                return False, "Web container running, AI missing"
            else:
                return False, "No containers running"
        except FileNotFoundError:
            return False, "Docker not installed"
        except subprocess.TimeoutExpired:
            return False, "Docker command timed out"

    def verify_ai_health(self) -> Tuple[bool, str]:
        """Check AI service health endpoint."""
        resp = requests.get(f"{self.ai_url}/health", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return True, f"Status: {data.get('status', 'unknown')}"
        return False, f"HTTP {resp.status_code}"

    def verify_model_info(self) -> Tuple[bool, str]:
        """Check model info endpoint."""
        resp = requests.get(f"{self.ai_url}/model/info", timeout=5)
        if resp.status_code in (200, 503):
            data = resp.json()
            loaded = data.get("model_loaded", False)
            mode = data.get("mode", "unknown")
            return True, f"Model loaded: {loaded}, Mode: {mode}"
        return False, f"HTTP {resp.status_code}"

    def verify_demo_signs(self) -> Tuple[bool, str]:
        """Check demo signs endpoint."""
        resp = requests.get(f"{self.ai_url}/demo/signs", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            count = len(data.get("signs", []))
            return True, f"{count} demo signs available"
        return False, f"HTTP {resp.status_code}"

    def verify_prediction(self) -> Tuple[bool, str]:
        """Check prediction endpoint."""
        start = time.time()
        resp = requests.post(f"{self.ai_url}/demo/predict/hello", timeout=10)
        latency = (time.time() - start) * 1000

        if resp.status_code == 200:
            data = resp.json()
            text = data.get("prediction", {}).get("text", "")
            conf = data.get("confidence", 0)
            return True, f"Text: '{text}', Confidence: {conf:.4f}, Latency: {latency:.0f}ms"
        return False, f"HTTP {resp.status_code}"

    def verify_cors(self) -> Tuple[bool, str]:
        """Check CORS headers."""
        resp = requests.options(
            f"{self.ai_url}/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
            timeout=5,
        )
        cors = resp.headers.get("access-control-allow-origin", "")
        if cors:
            return True, f"CORS origin: {cors}"
        return False, "No CORS headers"

    def verify_swagger(self) -> Tuple[bool, str]:
        """Check Swagger UI."""
        resp = requests.get(f"{self.ai_url}/docs", timeout=5)
        if resp.status_code == 200:
            return True, "Swagger UI available"
        return False, f"HTTP {resp.status_code}"

    def verify_webapp(self) -> Tuple[bool, str]:
        """Check frontend app."""
        resp = requests.get(self.web_url, timeout=10)
        if resp.status_code == 200:
            return True, f"Frontend serving (size: {len(resp.content)} bytes)"
        return False, f"HTTP {resp.status_code}"

    def verify_sequence_endpoint(self) -> Tuple[bool, str]:
        """Check demo sequence endpoint."""
        resp = requests.get(f"{self.ai_url}/demo/sequence/hello", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            frames = data.get("num_frames", 0)
            return True, f"Sequence: {frames} frames"
        return False, f"HTTP {resp.status_code}"

    def run_all(self) -> bool:
        """Run all verification checks."""
        print("\nSignBridge AI - Deployment Verification")
        print("=" * 60)

        print("\n[1] Docker")
        self.check("Docker containers", self.verify_docker)

        print("\n[2] AI Service")
        self.check("Health endpoint", self.verify_ai_health)
        self.check("Model info", self.verify_model_info)
        self.check("Swagger docs", self.verify_swagger)
        self.check("CORS headers", self.verify_cors)

        print("\n[3] Demo Mode")
        self.check("Demo signs list", self.verify_demo_signs)
        self.check("Demo sequence", self.verify_sequence_endpoint)
        self.check("Demo prediction", self.verify_prediction)

        print("\n[4] Frontend")
        self.check("Web app", self.verify_webapp)

        # Summary
        passed = sum(1 for r in self.results if r.passed)
        failed = sum(1 for r in self.results if not r.passed)
        total = len(self.results)

        print("\n" + "=" * 60)
        print(f"Results: {passed}/{total} passed, {failed} failed")

        if failed == 0:
            print("\n*** ALL CHECKS PASSED ***")
        else:
            print(f"\n*** {failed} CHECK(S) FAILED ***")

        return failed == 0


def main():
    ai_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
    web_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:3000"

    verifier = DeploymentVerifier(ai_url, web_url)
    success = verifier.run_all()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
