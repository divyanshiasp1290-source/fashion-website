-- ==============================================================================
-- MAISON MAKEEVA - SEED DATA SCRIPT
-- ==============================================================================

-- 1. SEED COLLECTIONS
INSERT INTO public.collections (id, name, slug, season, description, image, status)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Maison Makeeva Spring Summer SS26', 'ss26', 'New arrivals', 'Ready to wear collection built around cultural artistry, thick cotton, velvet, denim, and amplified MM identity.', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A9986_2048x.jpg?v=1763735666', 'active'),
    ('c0000000-0000-0000-0000-000000000002', 'Maison Makeeva Spring Summer SS24', 'ss24', 'Archive campaign', 'Graphic street-luxury silhouettes with campaign attitude and collectible MM codes.', 'https://www.maisonmakeeva.com/cdn/shop/files/RebelBlack_1024x1024_crop_center.jpg?v=1717758768', 'active'),
    ('c0000000-0000-0000-0000-000000000003', 'Athleisure Campaign', 'athleisure-campaign', 'Campaign', 'Performance-led jersey silhouettes and tracksuit sets shaped for movement, identity, and presence.', 'https://www.maisonmakeeva.com/cdn/shop/files/MM_pigalle-17_1024x1024_crop_center.png?v=1731458239', 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED MAIN CATEGORIES
INSERT INTO public.categories (id, name, slug, parent_id, sort_order, description, status)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'New Arrivals', 'new-arrivals', NULL, 1, 'SS26 Runway Collection & Latest Atelier Drops', 'active'),
    ('a0000000-0000-0000-0000-000000000002', 'Women', 'women', NULL, 2, 'Sculptural Draping & Tailored Feminine Silhouettes', 'active'),
    ('a0000000-0000-0000-0000-000000000003', 'Men', 'men', NULL, 3, 'Heavy Cotton Cuts & Architectural Menswear', 'active'),
    ('a0000000-0000-0000-0000-000000000004', 'Sets & Tracksuits', 'sets-tracksuits', NULL, 4, 'Two-Piece Uniforms in 300 GSM Cotton, Denim & Velvet', 'active'),
    ('a0000000-0000-0000-0000-000000000005', 'Archives', 'archives', NULL, 5, 'House Retrospective, Monographs & Creative Milestones', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED SUB-CATEGORIES (WOMEN)
INSERT INTO public.categories (id, name, slug, parent_id, sort_order, status)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'T-Shirts', 'women-t-shirts', 'a0000000-0000-0000-0000-000000000002', 1, 'active'),
    ('b0000000-0000-0000-0000-000000000002', 'Shirts', 'women-shirts', 'a0000000-0000-0000-0000-000000000002', 2, 'active'),
    ('b0000000-0000-0000-0000-000000000003', 'Jackets', 'women-jackets', 'a0000000-0000-0000-0000-000000000002', 3, 'active'),
    ('b0000000-0000-0000-0000-000000000004', 'Skirts & Mini Skirts', 'women-skirts-mini-skirts', 'a0000000-0000-0000-0000-000000000002', 4, 'active'),
    ('b0000000-0000-0000-0000-000000000005', 'Hoodies & Sweatshirts', 'women-hoodies-sweatshirts', 'a0000000-0000-0000-0000-000000000002', 5, 'active'),
    ('b0000000-0000-0000-0000-000000000006', 'Bodysuits & Jumpsuits', 'women-bodysuits-jumpsuits', 'a0000000-0000-0000-0000-000000000002', 6, 'active'),
    ('b0000000-0000-0000-0000-000000000007', 'Shoes & Slides', 'women-shoes-slides', 'a0000000-0000-0000-0000-000000000002', 7, 'active'),
    ('b0000000-0000-0000-0000-000000000008', 'Accessories', 'women-accessories', 'a0000000-0000-0000-0000-000000000002', 8, 'active')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SUB-CATEGORIES (MEN)
INSERT INTO public.categories (id, name, slug, parent_id, sort_order, status)
VALUES
    ('b0000000-0000-0000-0000-000000000009', 'T-Shirts', 'men-t-shirts', 'a0000000-0000-0000-0000-000000000003', 1, 'active'),
    ('b0000000-0000-0000-0000-000000000010', 'Shirts', 'men-shirts', 'a0000000-0000-0000-0000-000000000003', 2, 'active'),
    ('b0000000-0000-0000-0000-000000000011', 'Jackets', 'men-jackets', 'a0000000-0000-0000-0000-000000000003', 3, 'active'),
    ('b0000000-0000-0000-0000-000000000012', 'Trousers & Pants', 'men-trousers-pants', 'a0000000-0000-0000-0000-000000000003', 4, 'active'),
    ('b0000000-0000-0000-0000-000000000013', 'Hoodies & Sweatshirts', 'men-hoodies-sweatshirts', 'a0000000-0000-0000-0000-000000000003', 5, 'active'),
    ('b0000000-0000-0000-0000-000000000014', 'Shoes & Slides', 'men-shoes-slides', 'a0000000-0000-0000-0000-000000000003', 6, 'active'),
    ('b0000000-0000-0000-0000-000000000015', 'Accessories', 'men-accessories', 'a0000000-0000-0000-0000-000000000003', 7, 'active')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED SUB-CATEGORIES (ARCHIVES)
INSERT INTO public.categories (id, name, slug, parent_id, sort_order, status)
VALUES
    ('b0000000-0000-0000-0000-000000000016', 'History', 'archives-history', 'a0000000-0000-0000-0000-000000000005', 1, 'active'),
    ('b0000000-0000-0000-0000-000000000017', 'Lookbooks', 'archives-lookbooks', 'a0000000-0000-0000-0000-000000000005', 2, 'active'),
    ('b0000000-0000-0000-0000-000000000018', 'Creative Projects', 'archives-creative-projects', 'a0000000-0000-0000-0000-000000000005', 3, 'active'),
    ('b0000000-0000-0000-0000-000000000019', 'Diary', 'archives-diary', 'a0000000-0000-0000-0000-000000000005', 4, 'active'),
    ('b0000000-0000-0000-0000-000000000020', 'Evolution', 'archives-evolution', 'a0000000-0000-0000-0000-000000000005', 5, 'active')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED PRODUCTS
INSERT INTO public.products (id, name, slug, sku, description, short_description, story, price, compare_at_price, gender, category_id, subcategory_id, collection_id, badge, materials, tags, featured, new_arrival, status)
VALUES
    (
        'd0000000-0000-0000-0000-000000000001',
        'MM Orion202 Stonewashed Denim Set',
        'mm-orion202-stonewashed-denim-set',
        'MM-SS26-001',
        'Premium stonewashed denim set featuring Maison Makeeva’s signature DTS pattern prints and iconic M logo.',
        'Stonewashed denim two-piece statement with DTS monogram.',
        'A denim statement engineered with the density of workwear and the finish of a campaign piece.',
        250.00,
        NULL,
        'Unisex',
        'a0000000-0000-0000-0000-000000000004',
        NULL,
        'c0000000-0000-0000-0000-000000000001',
        'BEST SELLERS',
        ARRAY['Premium denim', 'Stonewashed treatment', 'DTS pattern print'],
        ARRAY['BEST SELLERS', 'stonewashed tracksuits', 'Men', 'Women', 'Unisex', 'Sets & Tracksuits'],
        true,
        true,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        'MM R-F-A - JERSEY Unisex',
        'mm-r-f-a-jersey-unisex',
        'MM-SS26-002',
        'A bold unisex jersey shaped around Maison Makeeva graphic codes and lightweight sports energy.',
        'Lightweight unisex sports-couture jersey.',
        'Cut for an oversized editorial silhouette, the R-F-A Jersey brings Maison Makeeva’s visual language into a breathable ready-to-wear piece.',
        65.00,
        NULL,
        'Unisex',
        'a0000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000010',
        'c0000000-0000-0000-0000-000000000001',
        'BEST SELLERS',
        ARRAY['100% polyester sports fabric', 'Sublimated artwork', 'Ribbed neckline'],
        ARRAY['BEST SELLERS', 'Unisex', 'Jersey', 'SS26', 'Men', 'Women', 'Shirts'],
        true,
        true,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000003',
        'MM Bovinille -101 TRACKSUIT SET UNISEX',
        'mm-bvinille-101-track-set-unisex',
        'MM-SS26-003',
        'Deep-bleach stonewashed set crafted from thick 300 GSM premium cotton for comfort, durability, and cultural artistry.',
        'Deep-bleached 300 GSM cotton heavyweight tracksuit.',
        'A unified silhouette with high-contrast wash treatments and Maison Makeeva graphics, designed as a complete look rather than separates.',
        175.00,
        NULL,
        'Unisex',
        'a0000000-0000-0000-0000-000000000004',
        NULL,
        'c0000000-0000-0000-0000-000000000001',
        'BEST SELLERS',
        ARRAY['300 GSM premium cotton', 'Stonewashed finish', 'Printed MM identity'],
        ARRAY['BEST SELLERS', 'Combination sets', 'tracksuit sets', 'Unisex', 'Maison Makeeva SS26', 'Sets & Tracksuits'],
        true,
        true,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000004',
        'MM NTOUBE-302 TRACKSUIT SET UNISEX',
        'mm-ntoube-302-tracksuit-set',
        'MM-SS26-004',
        'Premium velvet tracksuit set with a soft, rich feel and detailed craftsmanship across every panel.',
        'Architectural velvet tracksuit set with panel embroidery.',
        'NTOUBE-302 is the house’s plush uniform: elevated loungewear made precise, graphic, and evening-capable.',
        250.00,
        NULL,
        'Unisex',
        'a0000000-0000-0000-0000-000000000004',
        NULL,
        'c0000000-0000-0000-0000-000000000001',
        'BEST SELLERS',
        ARRAY['Premium velvet', 'Panel embroidery', 'Elasticated waist'],
        ARRAY['BEST SELLERS', 'Tracksuits', 'Unisex', 'maison makeeva tracksuits', 'Sets & Tracksuits'],
        false,
        true,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000005',
        'MM ROAR-WITH-FIERCE JERSEY SET',
        'mm-roar-with-fierce-jersey',
        'MM-ATH-005',
        'Cropped jersey and matching shorts in premium sports fabric, created for strength, culture, and identity.',
        'Cropped sports jersey and shorts combination set.',
        'A fierce two-piece campaign look that compresses Maison Makeeva’s graphic confidence into a summer uniform.',
        65.00,
        NULL,
        'Women',
        'a0000000-0000-0000-0000-000000000004',
        NULL,
        'c0000000-0000-0000-0000-000000000003',
        'BEST SELLERS',
        ARRAY['100% polyester sports fabric', 'Sublimated print', 'Cropped jersey'],
        ARRAY['BEST SELLERS', 'Unisex', 'Jersey', 'Combination sets', 'Sets & Tracksuits'],
        false,
        false,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000006',
        'MM Monogram Jumpsuit',
        'mm-monogram-jumpsuit',
        'MM-SS26-006',
        'One-piece silhouette featuring all-over sublimation print of the Maison Makeeva monogram.',
        'Second-skin monogram technical jumpsuit.',
        'A body-conscious graphic layer built with comfort and cultural repetition, designed to hold its own under denim or alone.',
        65.00,
        NULL,
        'Women',
        'a0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000006',
        'c0000000-0000-0000-0000-000000000001',
        NULL,
        ARRAY['Stretch technical jersey', 'All-over monogram print', 'Contour seams'],
        ARRAY['Bodysuits & Jumpsuits', 'JUMPSUIT', 'Women', 'womensbodysuit'],
        true,
        true,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000007',
        'MM ESANDE T-SHIRT UNISEX',
        'mm-esande-t-shirt-unisex',
        'MM-SS26-007',
        'Premium unisex tee with a gallery-scale MM artwork presence.',
        'Heavyweight graphic cotton tee with screenprint artwork.',
        'ESANDE is built like a collectible graphic object: clean from afar, intricate at close range.',
        125.00,
        NULL,
        'Unisex',
        'a0000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000009',
        'c0000000-0000-0000-0000-000000000001',
        NULL,
        ARRAY['Heavy cotton jersey', 'Screen printed artwork', 'Oversized fit'],
        ARRAY['Unisex', 'T-Shirt', 'Men', 'Women', 'T-Shirts'],
        false,
        true,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000008',
        'MM Agendia 007 Duffle Bag UNISEX',
        'mm-agendia-007-duffle-bag-unisex',
        'MM-SS26-008',
        'Statement duffle bag with Maison Makeeva scale, hardware, and travel presence.',
        'Sculptural travel duffle with signature hardware.',
        'A campaign carryall for the customer who treats the airport, the studio, and the street as one runway.',
        535.00,
        NULL,
        'Unisex',
        'a0000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000015',
        'c0000000-0000-0000-0000-000000000001',
        NULL,
        ARRAY['Structured shell', 'Premium hardware', 'Detachable strap'],
        ARRAY['Unisex', 'Bags & Wallets', 'Travel', 'Accessories', 'Men', 'Women'],
        true,
        false,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000009',
        'MM Wakamania Reality T- Shirt',
        'mm-wakamania-reality-t-shirt',
        'MM-SS24-009',
        'Graphic tee from the Wakamania world, cut for a relaxed street-luxury fit.',
        'Archival Wakamania cotton tee.',
        'A visual dispatch from the SS24 universe, pairing everyday wearability with a strong Maison Makeeva signature.',
        105.00,
        NULL,
        'Unisex',
        'a0000000-0000-0000-0000-000000000005',
        'b0000000-0000-0000-0000-000000000017',
        'c0000000-0000-0000-0000-000000000002',
        NULL,
        ARRAY['Cotton jersey', 'Printed front graphic', 'Relaxed silhouette'],
        ARRAY['T-Shirt', 'SS24', 'Unisex', 'Archives', 'T-Shirts', 'Men', 'Women'],
        false,
        false,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000010',
        'MM Monolith Bleached Denim Jacket',
        'mm-monolith-bleached-denim-jacket',
        'MM-SS26-010',
        'Heavy 14oz stonewashed denim jacket engineered with boxy sculptural shoulders and antique brass hardware.',
        '14oz stonewashed denim jacket with antique brass hardware.',
        'Developed in our Paris atelier with deep mineral wash distressing and archival Makeeva typographic stamp across the yoke.',
        295.00,
        NULL,
        'Unisex',
        'a0000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000011',
        'c0000000-0000-0000-0000-000000000001',
        'NEW ARRIVAL',
        ARRAY['14oz ring-spun denim', 'Custom cast hardware', 'Hand-finished bleach patina'],
        ARRAY['Jackets', 'Denim', 'Unisex', 'Men', 'Women', 'SS26', 'Outerwear'],
        true,
        true,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000011',
        'MM Sculptural Pleated Mini Skirt',
        'mm-sculptural-pleated-mini-skirt',
        'MM-SS26-011',
        'Structured architectural mini skirt with reinforced knife pleats and monogram waist detailing.',
        'Structured knife-pleated skirt with monogram waist detail.',
        'Designed to be paired with oversized jackets or the Monogram Jumpsuit for high-contrast runway proportions.',
        165.00,
        NULL,
        'Women',
        'a0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000004',
        'c0000000-0000-0000-0000-000000000001',
        'EXCLUSIVE',
        ARRAY['Heavy cotton twill', 'Concealed side zipper', 'Enamelled MM hardware'],
        ARRAY['Skirts & Mini Skirts', 'Women', 'SS26', 'Runway'],
        false,
        true,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000012',
        'MM Archival 450 GSM Heavy Hoodie',
        'mm-archival-450gsm-heavy-hoodie',
        'MM-SS24-012',
        'Ultra-heavyweight 450 GSM diagonal loopback fleece hoodie with double-layered architectural hood.',
        '450 GSM diagonal loopback fleece hoodie with high-density puff print.',
        'A house staple resurrected from the SS24 archive, showcasing high-density puff print and vintage cold-pigment garment dye.',
        195.00,
        NULL,
        'Unisex',
        'a0000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000013',
        'c0000000-0000-0000-0000-000000000002',
        'ARCHIVE REISSUE',
        ARRAY['450 GSM combed cotton fleece', 'Dense ribbing', 'Puff embroidery print'],
        ARRAY['Hoodies & Sweatshirts', 'Men', 'Women', 'Unisex', 'Archives', 'Heavy Cotton'],
        true,
        false,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000013',
        'MM Architectural Wide-Leg Trousers',
        'mm-architectural-wide-leg-trousers',
        'MM-SS26-013',
        'Relaxed wide-leg trousers cut with front pinch-pleats and adjustable cinch waistband.',
        'Wool-cotton wide-leg tailored trousers with pinch pleats.',
        'Engineered to drape seamlessly over boots or slides, marrying tailored sophistication with casual streetwear presence.',
        185.00,
        NULL,
        'Men',
        'a0000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000012',
        'c0000000-0000-0000-0000-000000000001',
        NULL,
        ARRAY['Wool-cotton blend twill', 'Deep side pockets', 'Internal drawstring'],
        ARRAY['Trousers & Pants', 'Men', 'SS26', 'Tailored'],
        false,
        true,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000014',
        'MM Atelier Monogram Slides',
        'mm-atelier-monogram-slides',
        'MM-SS26-014',
        'Molded ergonomic luxury slides with textured Maison Makeeva monogram strap and dual-density foam sole.',
        'Ergonomic luxury slides with embossed monogram strap.',
        'Crafted for effortless studio comfort and elevated warm-weather styling.',
        145.00,
        NULL,
        'Unisex',
        'a0000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000014',
        'c0000000-0000-0000-0000-000000000001',
        NULL,
        ARRAY['Molded EVA footbed', 'Embossed vegan leather upper', 'Anti-slip grooved tread'],
        ARRAY['Shoes & Slides', 'Unisex', 'Men', 'Women', 'Footwear', 'SS26'],
        false,
        true,
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- 7. SEED PRODUCT IMAGES
INSERT INTO public.product_images (product_id, image_url, sort_order, alt_text)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028', 0, 'Orion202 Front'),
    ('d0000000-0000-0000-0000-000000000001', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A0128_023d8da9-46ee-4888-b62c-5da9ecbc7615_1024x.jpg?v=1763739045', 1, 'Orion202 Detail'),
    ('d0000000-0000-0000-0000-000000000002', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A0059_1024x.jpg?v=1763488780', 0, 'RFA Jersey Front'),
    ('d0000000-0000-0000-0000-000000000002', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A9575_1024x.jpg?v=1763488798', 1, 'RFA Jersey Back'),
    ('d0000000-0000-0000-0000-000000000003', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A9978_1024x.jpg?v=1763606451', 0, 'Bovinille 101 Front'),
    ('d0000000-0000-0000-0000-000000000003', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A9997_8517fa4c-8149-4287-9bae-edb77c7a48af_2048x.jpg?v=1763735833', 1, 'Bovinille 101 Editorial'),
    ('d0000000-0000-0000-0000-000000000004', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A9818_b34e4184-86c5-45ac-a25a-e18704e91632_1024x.jpg?v=1763737823', 0, 'Ntoube 302 Front'),
    ('d0000000-0000-0000-0000-000000000004', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A0072_633fa3a3-04e3-42ed-98af-f0326da2c3c7_1024x.jpg?v=1763737880', 1, 'Ntoube 302 Detail'),
    ('d0000000-0000-0000-0000-000000000005', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A9664_52989f29-4f2f-4fa5-8112-24d611e627ea_1024x.jpg?v=1761580112', 0, 'Roar Jersey Front'),
    ('d0000000-0000-0000-0000-000000000005', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A9677_1024x.jpg?v=1761573023', 1, 'Roar Jersey Back'),
    ('d0000000-0000-0000-0000-000000000006', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A9985_1024x.jpg?v=1763589060', 0, 'Monogram Jumpsuit Front'),
    ('d0000000-0000-0000-0000-000000000006', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A0073_1024x.jpg?v=1763589060', 1, 'Monogram Jumpsuit Detail'),
    ('d0000000-0000-0000-0000-000000000007', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A0164_1024x.jpg?v=1763740068', 0, 'Esande Tee Front'),
    ('d0000000-0000-0000-0000-000000000007', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A0172_1024x.jpg?v=1763740068', 1, 'Esande Tee Back'),
    ('d0000000-0000-0000-0000-000000000008', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A0055_1024x.jpg?v=1761559327', 0, 'Agendia Bag Front'),
    ('d0000000-0000-0000-0000-000000000008', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A0047_1024x.jpg?v=1761559283', 1, 'Agendia Bag Detail'),
    ('d0000000-0000-0000-0000-000000000009', 'https://www.maisonmakeeva.com/cdn/shop/files/RebelBlack_1024x1024_crop_center.jpg?v=1717758768', 0, 'Wakamania Reality Front'),
    ('d0000000-0000-0000-0000-000000000010', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028', 0, 'Monolith Denim Jacket Front'),
    ('d0000000-0000-0000-0000-000000000011', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A9664_52989f29-4f2f-4fa5-8112-24d611e627ea_1024x.jpg?v=1761580112', 0, 'Sculptural Mini Skirt Front'),
    ('d0000000-0000-0000-0000-000000000012', 'https://www.maisonmakeeva.com/cdn/shop/files/RebelBlack_1024x1024_crop_center.jpg?v=1717758768', 0, 'Archival 450 GSM Hoodie Front'),
    ('d0000000-0000-0000-0000-000000000013', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A9818_b34e4184-86c5-45ac-a25a-e18704e91632_1024x.jpg?v=1763737823', 0, 'Architectural Trousers Front'),
    ('d0000000-0000-0000-0000-000000000014', 'https://www.maisonmakeeva.com/cdn/shop/files/D59A0055_1024x.jpg?v=1761559327', 0, 'Atelier Slides Front');

-- 8. SEED INVENTORY VARIANTS
INSERT INTO public.inventory (product_id, size, color, stock_quantity, low_stock_threshold)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'S', 'Washed indigo', 12, 5),
    ('d0000000-0000-0000-0000-000000000001', 'M', 'Washed indigo', 18, 5),
    ('d0000000-0000-0000-0000-000000000001', 'L', 'Washed indigo', 4, 5), -- Low stock alert
    ('d0000000-0000-0000-0000-000000000001', 'XL', 'Washed indigo', 2, 5), -- Low stock alert
    ('d0000000-0000-0000-0000-000000000002', 'XS', 'Graphite', 8, 3),
    ('d0000000-0000-0000-0000-000000000002', 'S', 'Graphite', 15, 5),
    ('d0000000-0000-0000-0000-000000000002', 'M', 'Graphite', 22, 5),
    ('d0000000-0000-0000-0000-000000000002', 'L', 'Graphite', 14, 5),
    ('d0000000-0000-0000-0000-000000000002', 'XL', 'Graphite', 7, 5),
    ('d0000000-0000-0000-0000-000000000003', 'S', 'Deep bleach', 10, 4),
    ('d0000000-0000-0000-0000-000000000003', 'M', 'Deep bleach', 16, 5),
    ('d0000000-0000-0000-0000-000000000003', 'L', 'Deep bleach', 3, 5), -- Low stock
    ('d0000000-0000-0000-0000-000000000004', 'M', 'Noir velvet', 9, 3),
    ('d0000000-0000-0000-0000-000000000004', 'L', 'Noir velvet', 5, 3),
    ('d0000000-0000-0000-0000-000000000006', 'S', 'Monogram noir', 14, 4),
    ('d0000000-0000-0000-0000-000000000006', 'M', 'Monogram noir', 12, 4),
    ('d0000000-0000-0000-0000-000000000008', 'OS', 'Noir', 6, 2),
    ('d0000000-0000-0000-0000-000000000010', 'M', 'Washed Indigo', 8, 3),
    ('d0000000-0000-0000-0000-000000000011', 'S', 'Noir', 7, 3),
    ('d0000000-0000-0000-0000-000000000012', 'L', 'Rebel Black', 11, 4),
    ('d0000000-0000-0000-0000-000000000014', 'EU 42', 'Matte Noir', 15, 5);

-- 9. SEED SAMPLE ORDERS (WITHOUT PAYMENT)
INSERT INTO public.orders (id, order_number, subtotal, shipping, total, customer_name, customer_email, customer_phone, shipping_address, order_status, created_at)
VALUES
    (
        'e0000000-0000-0000-0000-000000000001',
        'MM-2026-8801',
        425.00,
        0.00,
        425.00,
        'Camille Laurent',
        'camille.laurent@ateliermakeeva.fr',
        '+33 6 12 34 56 78',
        '{"name": "Camille Laurent", "address": "14 Avenue Montaigne", "city": "Paris", "postal_code": "75008", "country": "France"}'::jsonb,
        'Confirmed',
        timezone('utc'::text, now() - INTERVAL '2 days')
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'MM-2026-8802',
        250.00,
        0.00,
        250.00,
        'Marcus Sterling',
        'marcus.sterling@editorial.co.uk',
        '+44 7700 900123',
        '{"name": "Marcus Sterling", "address": "22 King Street", "city": "Manchester", "postal_code": "M2 4LQ", "country": "United Kingdom"}'::jsonb,
        'Pending',
        timezone('utc'::text, now() - INTERVAL '4 hours')
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, product_id, product_name, quantity, size, color, price, image_url)
VALUES
    (
        'e0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'MM Orion202 Stonewashed Denim Set',
        1,
        'M',
        'Washed indigo',
        250.00,
        'https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028'
    ),
    (
        'e0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000003',
        'MM Bovinille -101 TRACKSUIT SET UNISEX',
        1,
        'M',
        'Deep bleach',
        175.00,
        'https://www.maisonmakeeva.com/cdn/shop/files/D59A9978_1024x.jpg?v=1763606451'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000004',
        'MM NTOUBE-302 TRACKSUIT SET UNISEX',
        1,
        'L',
        'Noir velvet',
        250.00,
        'https://www.maisonmakeeva.com/cdn/shop/files/D59A9818_b34e4184-86c5-45ac-a25a-e18704e91632_1024x.jpg?v=1763737823'
    );

-- 10. SEED CONTACT MESSAGES
INSERT INTO public.contact_messages (name, email, phone, message, status, created_at)
VALUES
    ('Jean-Paul Dubois', 'jp.dubois@parisfashion.com', '+33 1 42 68 55 00', 'Inquiry regarding custom atelier fitting for Paris Fashion Week private presentation.', 'unread', timezone('utc'::text, now() - INTERVAL '1 day')),
    ('Aria Vance', 'aria.v@monograph.nyc', '+1 212 555 0199', 'Editorial archive loan request for upcoming contemporary African design exhibition in New York.', 'read', timezone('utc'::text, now() - INTERVAL '3 days'))
ON CONFLICT DO NOTHING;

-- 11. SEED NEWSLETTER SUBSCRIBERS
INSERT INTO public.newsletter_subscribers (email, status, subscribed_at)
VALUES
    ('collector@archiveluxury.com', 'active', timezone('utc'::text, now() - INTERVAL '5 days')),
    ('atelier.client@hautecouture.fr', 'active', timezone('utc'::text, now() - INTERVAL '2 days')),
    ('studio@resn-contemporary.org', 'active', timezone('utc'::text, now() - INTERVAL '10 days'))
ON CONFLICT (email) DO NOTHING;
