import sys
import os
import json
import io
import unittest
from fastapi.testclient import TestClient

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from main import app
from database import init_db, get_db

class TestExportLeadAI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def test_01_overview_metrics(self):
        res = self.client.get("/api/overview")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("metrics", data)
        self.assertIn("total_buyers", data["metrics"])
        self.assertIn("leads_by_country", data)
        self.assertIn("leads_by_status", data)
        self.assertGreater(data["metrics"]["total_buyers"], 0)
        print("✓ Overview API returns live database metrics")

    def test_02_leads_crud(self):
        # 1. Create Lead
        new_lead = {
            "contact_person": "Hans Zimmer",
            "company_name": "Acoustic Artistry Europe",
            "email": "hans.zimmer@acoustic-artistry-test.de",
            "phone": "+49 89 123456",
            "website": "https://www.acoustic-artistry-test.de",
            "country": "Germany",
            "state": "Bavaria",
            "city": "Munich",
            "buyer_category": "Wholesaler",
            "product_interest": "Full Moon Singing Bowls",
            "lead_source": "Manual Entry",
            "notes": "Automated unit test lead"
        }
        res = self.client.post("/api/leads", json=new_lead)
        self.assertEqual(res.status_code, 200)
        created = res.json()
        lead_id = created["id"]
        self.assertEqual(created["email"], "hans.zimmer@acoustic-artistry-test.de")

        # 2. Prevent duplicate email creation
        dup_res = self.client.post("/api/leads", json=new_lead)
        self.assertEqual(dup_res.status_code, 400)

        # 3. Update Lead
        update_data = {"city": "Frankfurt", "notes": "Updated via unit test"}
        up_res = self.client.put(f"/api/leads/{lead_id}", json=update_data)
        self.assertEqual(up_res.status_code, 200)
        self.assertEqual(up_res.json()["city"], "Frankfurt")

        # 4. Search / Filter Lead
        search_res = self.client.get("/api/leads?search=Acoustic+Artistry")
        self.assertEqual(search_res.status_code, 200)
        self.assertEqual(len(search_res.json()["leads"]), 1)

        # 5. Delete Lead
        del_res = self.client.delete(f"/api/leads/{lead_id}")
        self.assertEqual(del_res.status_code, 200)
        print("✓ Lead CRUD operations, duplicate prevention, and search verified")

    def test_03_email_validation(self):
        # Single validation
        valid_res = self.client.post("/api/validate-email", json={"email": "contact@google.com"})
        self.assertEqual(valid_res.status_code, 200)
        self.assertEqual(valid_res.json()["status"], "Valid")

        # Fake domain validation
        invalid_res = self.client.post("/api/validate-email", json={"email": "nobody@nonexistentdomain12345fake.fake"})
        self.assertEqual(invalid_res.status_code, 200)
        self.assertEqual(invalid_res.json()["status"], "Invalid")

        # Disposable email detection
        disp_res = self.client.post("/api/validate-email", json={"email": "user@mailinator.com"})
        self.assertEqual(disp_res.status_code, 200)
        self.assertEqual(disp_res.json()["status"], "Invalid")
        self.assertTrue(disp_res.json()["is_disposable"])

        # Batch validation
        batch_res = self.client.post("/api/validate-batch", json={"validate_all_unverified": False})
        self.assertEqual(batch_res.status_code, 200)
        self.assertIn("valid", batch_res.json())
        print("✓ Email validation engine (RFC syntax, MX resolution, disposable detection) verified")

    def test_04_ai_classification_fallback(self):
        # Test rule-based fallback classification
        lead_sample = {
            "company_name": "Hamburg Esoterik Großhandel GmbH",
            "contact_person": "Dieter Becker",
            "email": "d.becker@hamburg-esoterik.de",
            "buyer_category": "Wholesaler",
            "product_interest": "Handcrafted Tibetan Singing Bowls",
            "lead_source": "ImportYeti",
            "notes": ""
        }
        from services.classifier import rule_based_classify
        result = rule_based_classify(lead_sample)
        self.assertIn(result["classification"], ["Importer", "Wholesaler"])
        self.assertTrue(len(result["reasoning"]) > 0)

        # Batch classification endpoint
        batch_ai = self.client.post("/api/classify-batch", json={"classify_all_pending": False})
        self.assertEqual(batch_ai.status_code, 200)
        print("✓ AI qualification and intelligent rule-based fallback verified")

    def test_05_buyer_discovery(self):
        req = {
            "product_name": "Tibetan Singing Bowls",
            "target_country": "United States",
            "state": "California",
            "city": "San Francisco",
            "buyer_category": "Wellness Business"
        }
        res = self.client.post("/api/discovery/search", json=req)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(len(data["queries"]), 3)
        self.assertGreater(len(data["discovered_leads"]), 0)

        # Import discovered lead
        lead_to_import = data["discovered_leads"][0]
        imp_res = self.client.post("/api/discovery/import-leads", json={"leads": [lead_to_import]})
        self.assertEqual(imp_res.status_code, 200)
        print("✓ Buyer Discovery query generation and contextual lead import verified")

    def test_06_campaign_creation_and_demo_send(self):
        # Create campaign
        camp_payload = {
            "name": "Integration Test Outreach Campaign",
            "subject": "Direct Manufacturer Inquiry for {{company_name}}",
            "body_template": "Dear {{contact_person}},\n\nWe are {{sender_company}} from India offering {{product_interest}}.",
            "filter_country": "All",
            "filter_category": "All",
            "is_demo_mode": True,
            "attachment_name": "sample_product_presentation.pdf"
        }
        create_res = self.client.post("/api/campaigns", json=camp_payload)
        self.assertEqual(create_res.status_code, 200)
        camp_id = create_res.json()["id"]

        # Preview email
        prev_res = self.client.post("/api/campaigns/preview", json={
            "subject": camp_payload["subject"],
            "body": camp_payload["body_template"]
        })
        self.assertEqual(prev_res.status_code, 200)
        self.assertIn("Dear", prev_res.json()["rendered_body"])

        # Execute Demo Send
        send_res = self.client.post(f"/api/campaigns/{camp_id}/send", json={"is_demo_mode": True})
        self.assertEqual(send_res.status_code, 200)
        self.assertTrue(send_res.json()["is_demo_mode"])
        self.assertGreater(send_res.json()["sent_count"], 0)

        # Inspect Campaign
        insp_res = self.client.get(f"/api/campaigns/{camp_id}")
        self.assertEqual(insp_res.status_code, 200)
        self.assertEqual(insp_res.json()["campaign"]["status"], "Completed")
        self.assertGreater(len(insp_res.json()["logs"]), 0)
        print("✓ Email campaign creation, template interpolation, demo send & logging verified")

    def test_07_csv_import_export(self):
        # Export CSV
        exp_res = self.client.get("/api/leads/export-csv")
        self.assertEqual(exp_res.status_code, 200)
        self.assertIn("text/csv", exp_res.headers["content-type"])
        csv_text = exp_res.text
        self.assertIn("company_name", csv_text)

        # Import CSV
        sample_csv = "Contact Person,Company Name,Email,Country,Buyer Category,Product Interest\n" \
                     "John Smith,Smith Imports LLC,john.smith@smithimports-test.com,United States,Importer,Singing Bowls\n"
        files = {"file": ("test_import.csv", io.BytesIO(sample_csv.encode("utf-8")), "text/csv")}
        imp_res = self.client.post("/api/leads/import-csv", files=files)
        self.assertEqual(imp_res.status_code, 200)
        self.assertEqual(imp_res.json()["added"], 1)

        # Clean up test imported lead
        del_lead = self.client.get("/api/leads?search=smithimports-test.com").json()["leads"]
        if del_lead:
            self.client.delete(f"/api/leads/{del_lead[0]['id']}")
        print("✓ CSV export and file upload import verified")

    def test_08_settings_and_catalog(self):
        # Settings
        set_res = self.client.get("/api/settings")
        self.assertEqual(set_res.status_code, 200)
        self.assertIn("company_name", set_res.json()["settings"])

        # Catalog PDF download
        cat_res = self.client.get("/api/campaigns/download-catalog")
        self.assertEqual(cat_res.status_code, 200)
        self.assertEqual(cat_res.headers["content-type"], "application/pdf")
        self.assertGreater(len(cat_res.content), 5000)
        print("✓ Settings API and Catalog PDF generation verified")

if __name__ == "__main__":
    unittest.main()
