import urllib.parse
from typing import Dict, Any, List

def generate_discovery_queries(product: str, country: str, state: str = "", city: str = "", category: str = "") -> List[Dict[str, str]]:
    """
    Generates targeted external search queries and 1-click search URLs for major trade discovery platforms.
    """
    location = f"{city} {state} {country}".strip().replace("  ", " ")
    if not location:
        location = country or "International"

    queries = []

    # 1. Google Advanced Search (B2B Importer / Wholesaler Dorks)
    g_dork_1 = f'"{product}" ("importer" OR "wholesaler" OR "distributor") ("{country}") ("contact us" OR "email")'
    g_url_1 = f"https://www.google.com/search?q={urllib.parse.quote_plus(g_dork_1)}"
    queries.append({
        "platform": "Google Search (B2B Dork)",
        "icon": "Search",
        "query": g_dork_1,
        "url": g_url_1,
        "description": "Finds indexed company contact pages and wholesale importer listings.",
        "badge": "Search Dork"
    })

    # 2. LinkedIn Company Search
    li_query = f'{product} {category or "importer wholesaler"} {country}'
    li_url = f"https://www.linkedin.com/search/results/companies/?keywords={urllib.parse.quote_plus(li_query)}"
    queries.append({
        "platform": "LinkedIn Companies",
        "icon": "Linkedin",
        "query": li_query,
        "url": li_url,
        "description": "Locate international companies, purchasing directors, and trade officers.",
        "badge": "Professional Network"
    })

    # 3. Google Maps Local Business Directory
    maps_query = f"{product} {category or 'store distributor'} in {location}"
    maps_url = f"https://www.google.com/maps/search/{urllib.parse.quote_plus(maps_query)}"
    queries.append({
        "platform": "Google Maps & Places",
        "icon": "MapPin",
        "query": maps_query,
        "url": maps_url,
        "description": "Discover physical retail stores, wellness centers, and local wholesalers with phone & address.",
        "badge": "Geographic Search"
    })

    # 4. ImportYeti Customs Bill of Lading Search
    iy_query = product
    iy_url = f"https://www.importyeti.com/search?q={urllib.parse.quote_plus(iy_query)}"
    queries.append({
        "platform": "ImportYeti Customs Data",
        "icon": "Ship",
        "query": f"Bills of Lading search for '{iy_query}'",
        "url": iy_url,
        "description": "View actual sea shipment bills of lading for US & European sea-freight importers.",
        "badge": "Trade Customs"
    })

    # 5. International Trade Shows & Exhibitions
    ts_query = f'"{product}" trade show exhibition conference {country} 2026'
    ts_url = f"https://www.google.com/search?q={urllib.parse.quote_plus(ts_query)}"
    queries.append({
        "platform": "Trade Show Directories",
        "icon": "Calendar",
        "query": ts_query,
        "url": ts_url,
        "description": "Exhibitor directories from major trade fairs (Ambiente, ASD Market Week, Maison&Objet).",
        "badge": "Exhibition Directory"
    })

    # 6. Global Business Directories (Europages / ThomasNet)
    if country.lower() in ["united states", "usa", "canada"]:
        dir_name = "ThomasNet Industrial & Trade"
        dir_query = f"https://www.thomasnet.com/search.html?cov=NA&what={urllib.parse.quote_plus(product)}"
    else:
        dir_name = "Europages B2B Directory"
        dir_query = f"https://www.europages.co.uk/enterprise-search.html?keyword={urllib.parse.quote_plus(product)}"
    
    queries.append({
        "platform": dir_name,
        "icon": "Globe",
        "query": f"B2B Supplier & Buyer Registry for {product}",
        "url": dir_query,
        "description": "Verified commercial business registrations and purchasing agents.",
        "badge": "B2B Registry"
    })

    # 7. Alibaba Global Buyer Inquiries
    ali_query = product
    ali_url = f"https://www.alibaba.com/trade/search?SearchText={urllib.parse.quote_plus(ali_query)}"
    queries.append({
        "platform": "Alibaba Buyer Directory",
        "icon": "ShoppingBag",
        "query": ali_query,
        "url": ali_url,
        "description": "Explore RFQs and global buyer requests for overseas shipments.",
        "badge": "Wholesale Hub"
    })

    return queries

def generate_contextual_leads(product: str, country: str, state: str = "", city: str = "", category: str = "") -> List[Dict[str, Any]]:
    """
    Generates realistic contextual discovery results tailored to the user's search inputs.
    Clearly marked with sample badge, providing instant trial value.
    """
    target_country = country or "United States"
    target_city = city or ("New York" if target_country == "United States" else "London" if target_country == "United Kingdom" else "Munich" if target_country == "Germany" else "Metropolitan Area")
    target_category = category or "Wholesaler"
    clean_prod = product or "Artisan Handicrafts"

    # Variations of realistic companies based on product and category
    results = [
        {
            "contact_person": "Alexander Vance",
            "company_name": f"{clean_prod.split()[0]} Apex Trading Group",
            "email": f"alex.vance@{clean_prod.split()[0].lower()}apex-group.com",
            "phone": "+1 (212) 555-0149" if target_country == "United States" else "+44 20 7946 0883",
            "website": f"https://www.{clean_prod.split()[0].lower()}apex-group.com",
            "country": target_country,
            "state": state or ("New York" if target_country == "United States" else ""),
            "city": target_city,
            "buyer_category": target_category if target_category != "All" else "Importer",
            "product_interest": f"Wholesale Bulk Shipments of {clean_prod}",
            "lead_source": "ImportYeti",
            "notes": f"Discovered via Customs B/L record. Active shipments of {clean_prod} from South Asia.",
            "is_demo": 1
        },
        {
            "contact_person": "Sophia Martinez",
            "company_name": f"Pacific Horizon {target_category} LLC",
            "email": f"smartinez@pacifichorizon-{target_category.lower().replace(' ', '')}.com",
            "phone": "+1 (415) 555-0192" if target_country == "United States" else "+49 30 8921 7712",
            "website": f"https://www.pacifichorizon-{target_category.lower().replace(' ', '')}.com",
            "country": target_country,
            "state": state or "California",
            "city": target_city,
            "buyer_category": target_category if target_category != "All" else "Distributor",
            "product_interest": f"Direct Sourcing: Handcrafted {clean_prod}",
            "lead_source": "LinkedIn",
            "notes": "Head of Strategic Procurement. Seeking direct Indian manufacturing partner.",
            "is_demo": 1
        },
        {
            "contact_person": "Julian Thorne",
            "company_name": f"Crown & Crest {clean_prod.split()[0]} Studio",
            "email": f"julian.thorne@crowncrest-{clean_prod.split()[0].lower()}.org",
            "phone": "+44 161 496 0233" if target_country == "United Kingdom" else "+1 (617) 555-0184",
            "website": f"https://www.crowncrest-{clean_prod.split()[0].lower()}.org",
            "country": target_country,
            "state": state or "Ontario" if target_country == "Canada" else state or "Greater London",
            "city": target_city,
            "buyer_category": "Retailer" if target_category == "All" else target_category,
            "product_interest": f"Premium Curated {clean_prod} for Boutique Display",
            "lead_source": "Google Maps",
            "notes": "Retail store & showroom looking for low MOQ trial orders with custom branding.",
            "is_demo": 1
        },
        {
            "contact_person": "Dr. Beatrice Lin",
            "company_name": f"Holistic Living Distribution Corp",
            "email": f"procurement@holisticliving-{target_country.lower().replace(' ', '')}.com",
            "phone": "+1 (312) 555-0177" if target_country == "United States" else "+61 2 9876 1122",
            "website": f"https://www.holisticliving-{target_country.lower().replace(' ', '')}.com",
            "country": target_country,
            "state": state or "Illinois",
            "city": target_city,
            "buyer_category": "Distributor",
            "product_interest": f"Eco-friendly & Acoustic {clean_prod}",
            "lead_source": "Google Search",
            "notes": "Distributes to 80+ specialty wellness pharmacies and concept stores.",
            "is_demo": 1
        }
    ]

    return results
