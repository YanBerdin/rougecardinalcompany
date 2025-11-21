SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: abonnes_newsletter; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: medias; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."medias" ("id", "storage_path", "filename", "mime", "size_bytes", "alt_text", "metadata", "uploaded_by", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'press-kit/logos/rouge-cardinal-logo-horizontal.svg', 'rouge-cardinal-logo-horizontal.svg', 'image/svg+xml', 15360, 'Logo Rouge Cardinal Company - Format horizontal', '{"type": "logo", "title": "Logo Horizontal SVG", "external_url": "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/theater.svg"}', NULL, '2025-11-21 00:35:38.372722+00', '2025-11-21 00:35:38.372722+00'),
	(2, 'press-kit/logos/rouge-cardinal-logo-vertical.png', 'rouge-cardinal-logo-vertical.png', 'image/png', 245760, 'Logo Rouge Cardinal Company - Format vertical', '{"type": "logo", "title": "Logo Vertical PNG", "external_url": "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400&h=600&fit=crop"}', NULL, '2025-11-21 00:35:38.372722+00', '2025-11-21 00:35:38.372722+00'),
	(3, 'press-kit/logos/rouge-cardinal-icon.svg', 'rouge-cardinal-icon.svg', 'image/svg+xml', 8192, 'Icône Rouge Cardinal Company', '{"type": "icon", "title": "Icône SVG", "external_url": "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/theater.svg"}', NULL, '2025-11-21 00:35:38.372722+00', '2025-11-21 00:35:38.372722+00'),
	(4, 'photos/spectacle-scene-1.jpg', 'spectacle-scene-1.jpg', 'image/jpeg', 2048000, 'Scène du spectacle - Photo 1', '{"type": "photo", "usage": "press", "resolution": "300dpi", "external_url": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1920&h=1280&fit=crop&fm=jpg&q=80"}', NULL, '2025-11-21 00:35:38.372722+00', '2025-11-21 00:35:38.372722+00'),
	(5, 'photos/spectacle-scene-2.jpg', 'spectacle-scene-2.jpg', 'image/jpeg', 2150000, 'Scène du spectacle - Photo 2', '{"type": "photo", "usage": "press", "resolution": "300dpi", "external_url": "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1920&h=1280&fit=crop&fm=jpg&q=80"}', NULL, '2025-11-21 00:35:38.372722+00', '2025-11-21 00:35:38.372722+00'),
	(6, 'photos/equipe-artistique.jpg', 'equipe-artistique.jpg', 'image/jpeg', 1890000, 'Équipe artistique Rouge Cardinal', '{"type": "photo", "usage": "press", "resolution": "300dpi", "external_url": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=1280&fit=crop&fm=jpg&q=80"}', NULL, '2025-11-21 00:35:38.372722+00', '2025-11-21 00:35:38.372722+00'),
	(7, 'dossiers/dossier-presse-2025.pdf', 'dossier-presse-2025.pdf', 'application/pdf', 3145728, 'Dossier de presse 2025', '{"type": "press_kit", "year": 2025, "pages": 24, "external_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}', NULL, '2025-11-21 00:35:38.372722+00', '2025-11-21 00:35:38.372722+00'),
	(8, 'dossiers/fiche-technique-spectacle.pdf', 'fiche-technique-spectacle.pdf', 'application/pdf', 512000, 'Fiche technique spectacle', '{"type": "technical_sheet", "category": "spectacle", "external_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}', NULL, '2025-11-21 00:35:38.372722+00', '2025-11-21 00:35:38.372722+00');


--
-- Data for Name: articles_presse; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."articles_presse" ("id", "title", "author", "type", "slug", "chapo", "excerpt", "source_publication", "source_url", "published_at", "created_at", "updated_at", "search_vector", "meta_title", "meta_description", "og_image_media_id", "schema_type", "canonical_url", "keywords") OVERRIDING SYSTEM VALUE VALUES
	(1, 'Réinvention ardente de Roméo et Juliette', 'Camille Martin', 'critique', 'critique-romeo-juliette-telerama', 'Un spectacle incandescent porté par une troupe vibrante.', 'Une lecture contemporaine qui assume ses audaces, sans trahir l’émotion originelle.', 'Télérama', 'https://www.telerama.fr/sortir/critique-romeo-juliette', '2025-12-02 08:00:00+00', '2025-11-21 00:35:37.135033+00', '2025-11-21 00:35:37.135033+00', NULL, NULL, NULL, NULL, 'Article', NULL, NULL),
	(2, 'La Tempête, entre sortilèges et douceur', 'Hugo Bernard', 'chronique', 'la-tempete-lemonde-chronique', 'Une proposition visuelle puissante, servie par une direction d’acteurs précise.', 'Le plateau devient carte des vents, les corps dessinent l’orage.', 'Le Monde', 'https://www.lemonde.fr/culture/article/2026/03/02/la-tempete', '2026-03-02 07:30:00+00', '2025-11-21 00:35:37.135033+00', '2025-11-21 00:35:37.135033+00', NULL, NULL, NULL, NULL, 'Article', NULL, NULL),
	(3, 'Entretien: la franchise de Molière aujourd’hui', 'Julie Rey', 'entretien', 'misanthrope-liberation-entretien', 'Un dialogue sur la misanthropie contemporaine et ses ambiguïtés.', 'Entre satire et tendresse, la mise à nu des relations.', 'Libération', 'https://www.liberation.fr/culture/theatre/misanthrope', '2025-10-06 10:15:00+00', '2025-11-21 00:35:37.135033+00', '2025-11-21 00:35:37.135033+00', NULL, NULL, NULL, NULL, 'Article', NULL, NULL);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."categories" ("id", "name", "slug", "description", "parent_id", "color", "icon", "display_order", "is_active", "created_at", "created_by", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'Théâtral', 'theatral', 'Productions théâtrales classiques et contemporaines', NULL, '#e74c3c', 'theater', 10, true, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(2, 'Musical', 'musical', 'Spectacles mêlant théâtre et musique', NULL, '#9b59b6', 'music', 20, true, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(3, 'Jeune Public', 'jeune-public', 'Spectacles adaptés aux enfants et adolescents', NULL, '#f39c12', 'users', 30, true, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(4, 'Création', 'creation', 'Créations originales de la compagnie', NULL, '#27ae60', 'lightbulb', 40, true, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(5, 'Reprise', 'reprise', 'Reprises et adaptations d''œuvres existantes', NULL, '#3498db', 'refresh-cw', 50, true, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(6, 'Nouvelles Créations', 'nouvelles-creations', 'Annonces de nouvelles créations théâtrales', NULL, NULL, NULL, 1, true, '2025-11-21 00:35:38.372722+00', NULL, '2025-11-21 00:35:38.372722+00'),
	(7, 'Tournées', 'tournees', 'Dates de tournée et représentations', NULL, NULL, NULL, 2, true, '2025-11-21 00:35:38.372722+00', NULL, '2025-11-21 00:35:38.372722+00'),
	(8, 'Prix et Distinctions', 'prix-distinctions', 'Récompenses et reconnaissances', NULL, NULL, NULL, 3, true, '2025-11-21 00:35:38.372722+00', NULL, '2025-11-21 00:35:38.372722+00'),
	(9, 'Partenariats', 'partenariats', 'Collaborations et partenariats institutionnels', NULL, NULL, NULL, 4, true, '2025-11-21 00:35:38.372722+00', NULL, '2025-11-21 00:35:38.372722+00');


--
-- Data for Name: articles_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: articles_medias; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tags" ("id", "name", "slug", "description", "usage_count", "is_featured", "created_at", "created_by", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'Shakespeare', 'shakespeare', 'Œuvres de William Shakespeare', 0, true, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(2, 'Molière', 'moliere', 'Œuvres de Molière', 0, true, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(3, 'Contemporain', 'contemporain', 'Théâtre contemporain', 0, true, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(4, 'Classique', 'classique', 'Théâtre classique', 0, true, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(5, 'Musical', 'musical', 'Spectacles musicaux', 0, false, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(6, 'Famille', 'famille', 'Spectacles familiaux', 0, false, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(7, 'Solo', 'solo', 'Spectacles en solo', 0, false, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(8, 'Duo', 'duo', 'Spectacles à deux interprètes', 0, false, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(9, 'Troupe', 'troupe', 'Spectacles avec la troupe complète', 0, false, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(10, 'Improvisation', 'improvisation', 'Spectacles d''improvisation', 0, false, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(11, 'Comédie', 'comedie', 'Spectacles comiques', 0, true, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(12, 'Drame', 'drame', 'Spectacles dramatiques', 0, true, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(13, 'Poésie', 'poesie', 'Spectacles poétiques', 0, false, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(14, 'Danse', 'danse', 'Spectacles intégrant la danse', 0, false, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00'),
	(15, 'Interactive', 'interactive', 'Spectacles interactifs avec le public', 0, false, '2025-11-21 00:35:38.045222+00', NULL, '2025-11-21 00:35:38.045222+00');


--
-- Data for Name: articles_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: lieux; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."lieux" ("id", "nom", "adresse", "ville", "code_postal", "pays", "latitude", "longitude", "capacite", "metadata", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'Salle des Fêtes de Montreuil', '88 Avenue Parmentier', 'Montreuil', '93100', 'France', 48.8592, 2.4417, 300, '{}', '2025-11-21 00:35:37.900472+00', '2025-11-21 00:35:37.900472+00'),
	(2, 'Théâtre Municipal de Lyon', '2 Rue de la République', 'Lyon', '69001', 'France', 45.764043, 4.835659, 800, '{}', '2025-11-21 00:35:37.900472+00', '2025-11-21 00:35:37.900472+00'),
	(3, 'Théâtre de la Cité', '15 Rue de la République', 'Toulouse', '31000', 'France', 43.6047, 1.4442, 600, '{}', '2025-11-21 00:35:37.900472+00', '2025-11-21 00:35:37.900472+00'),
	(4, 'Centre Culturel Jacques Brel', '1 Place Salvador Allende', 'Thonon-les-Bains', '74200', 'France', 46.3719, 6.4813, 450, '{}', '2025-11-21 00:35:37.900472+00', '2025-11-21 00:35:37.900472+00'),
	(5, 'Maison de la Culture de Grenoble', '4 Rue du Vieux Temple', 'Grenoble', '38000', 'France', 45.1885, 5.7245, 500, '{}', '2025-11-21 00:35:37.900472+00', '2025-11-21 00:35:37.900472+00');


--
-- Data for Name: spectacles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."spectacles" ("id", "title", "slug", "status", "description", "short_description", "genre", "duration_minutes", "casting", "premiere", "image_url", "public", "awards", "created_by", "created_at", "updated_at", "search_vector", "meta_title", "meta_description", "og_image_media_id", "schema_type", "canonical_url") OVERRIDING SYSTEM VALUE VALUES
	(1, 'Le Misanthrope', 'le-misanthrope', 'actuellement', 'Satire mordante des mœurs et des hypocrisies sociales.', 'Molière en version incisive et moderne.', 'comedie', 105, 6, '2025-09-30 20:00:00+00', 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg', true, NULL, NULL, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(2, 'La Tempête', 'la-tempete', 'actuellement', 'Magie, pouvoir et rédemption sur une île mystérieuse.', 'Un conte envoûtant entre illusion et réalité.', 'Drame', 110, 7, '2026-02-20 20:00:00+00', 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg', true, NULL, NULL, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(3, 'Roméo et Juliette', 'romeo-et-juliette', 'actuellement', 'Réinterprétation contemporaine du classique de Shakespeare.', 'Une fresque amoureuse et tragique revisitée.', 'Drame', 120, 8, '2025-11-15 20:00:00+00', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg', true, NULL, NULL, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(8, 'Rêves d''Enfance', 'reves-d-enfance', 'archive', 'Un spectacle familial poétique qui ravive la magie de l''enfance chez petits et grands.', 'Spectacle familial poétique.', 'Tout public', 80, 3, '2021-11-02 18:00:00+00', 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200', true, NULL, NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(4, 'Les Murmures du Temps', 'les-murmures-du-temps', 'actuellement', 'Un voyage poétique à travers les âges, où passé et présent se rencontrent dans un dialogue bouleversant. Cette création originale explore les liens invisibles qui nous unissent à travers le temps.', 'Voyage poétique entre passé et présent.', 'Drame contemporain', 90, 4, '2023-10-15 18:30:00+00', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200', true, '{"Nominé aux Molières 2024"}', NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(5, 'Fragments d''Éternité', 'fragments-d-eternite', 'actuellement', 'Une création originale qui explore les liens invisibles qui nous unissent, entre rire et larmes. Un spectacle touchant sur la condition humaine et nos quêtes de sens.', 'Création originale sur les liens invisibles.', 'Création originale', 105, 6, '2024-01-12 19:30:00+00', 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1200', true, NULL, NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(6, 'La Danse des Ombres', 'la-danse-des-ombres', 'archive', 'Adaptation moderne d''un classique, revisité avec audace et sensibilité par notre équipe artistique.', 'Classique revisité avec audace.', 'Classique revisité', 95, 5, '2023-05-10 18:30:00+00', 'https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=1200', true, '{"Prix du Public - Festival d''Avignon"}', NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(7, 'Échos de Liberté', 'echos-de-liberte', 'archive', 'Un spectacle engagé sur les droits humains et la liberté d''expression dans le monde contemporain.', 'Spectacle engagé sur les droits humains.', 'Théâtre documentaire', 100, 4, '2022-03-18 19:30:00+00', 'https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=1200', true, '{"Mention spéciale - Théâtre et Société"}', NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(9, 'Solitudes Partagées', 'solitudes-partagees', 'archive', 'Une réflexion intimiste sur la solitude moderne et les moyens de créer du lien dans notre société.', 'Réflexion intimiste sur la solitude.', 'Drame psychologique', 110, 2, '2020-09-25 18:00:00+00', 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200', true, '{"Prix de la Critique"}', NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(10, 'Mémoires de Guerre', 'memoires-de-guerre', 'archive', 'Un témoignage bouleversant sur les survivants de guerre et la transmission de la mémoire.', 'Témoignage sur la mémoire de guerre.', 'Théâtre historique', 120, 6, '2019-11-11 19:30:00+00', 'https://images.pexels.com/photos/3184396/pexels-photo-3184396.jpeg?auto=compress&cs=tinysrgb&w=1200', true, '{"Grand Prix du Jury - Festival de Nancy"}', NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(11, 'Les Voix du Silence', 'les-voix-du-silence', 'archive', 'Spectacle inclusif donnant la parole aux personnes sourdes et malentendantes.', 'Spectacle inclusif sur la surdité.', 'Théâtre social', 85, 5, '2019-06-15 18:00:00+00', 'https://images.pexels.com/photos/3184327/pexels-photo-3184327.jpeg?auto=compress&cs=tinysrgb&w=1200', true, '{"Prix de l''Innovation Sociale"}', NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(12, 'Nuit Blanche à Paris', 'nuit-blanche-a-paris', 'archive', 'Une comédie romantique pleine de rebondissements dans les rues de la capitale.', 'Comédie romantique parisienne.', 'Comédie', 95, 4, '2018-12-20 19:30:00+00', 'https://images.pexels.com/photos/3184354/pexels-photo-3184354.jpeg?auto=compress&cs=tinysrgb&w=1200', true, NULL, NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(13, 'L''Appel de la Forêt', 'l-appel-de-la-foret', 'archive', 'Adaptation théâtrale du chef-d''œuvre de Jack London, entre aventure et introspection.', 'Adaptation de Jack London.', 'Aventure dramatique', 105, 3, '2018-03-22 19:00:00+00', 'https://images.pexels.com/photos/3184372/pexels-photo-3184372.jpeg?auto=compress&cs=tinysrgb&w=1200', true, '{"Coup de Cœur du Public"}', NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(14, 'Portraits de Famille', 'portraits-de-famille', 'archive', 'Une chronique familiale touchante sur trois générations de femmes.', 'Chronique familiale sur trois générations.', 'Drame familial', 115, 7, '2017-10-05 18:30:00+00', 'https://images.pexels.com/photos/3184387/pexels-photo-3184387.jpeg?auto=compress&cs=tinysrgb&w=1200', true, '{"Prix de la Meilleure Interprétation Féminine"}', NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(15, 'Renaissance', 'renaissance', 'archive', 'Un spectacle musical célébrant la renaissance culturelle après les temps difficiles.', 'Spectacle musical sur la renaissance.', 'Comédie musicale', 130, 8, '2017-04-18 17:30:00+00', 'https://images.pexels.com/photos/3184445/pexels-photo-3184445.jpeg?auto=compress&cs=tinysrgb&w=1200', true, NULL, NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL),
	(16, 'Les Chemins de Traverse', 'les-chemins-de-traverse', 'archive', 'Un road-movie théâtral sur la quête d''identité et les rencontres qui changent une vie.', 'Road-movie théâtral.', 'Drame contemporain', 100, 4, '2016-09-12 18:00:00+00', 'https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1200', true, '{"Révélation de l''Année"}', NULL, '2025-11-21 00:35:37.797667+00', '2025-11-21 00:35:40.388051+00', NULL, NULL, NULL, NULL, 'TheaterEvent', NULL);


--
-- Data for Name: evenements; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."evenements" ("id", "spectacle_id", "lieu_id", "date_debut", "date_fin", "capacity", "price_cents", "status", "metadata", "recurrence_rule", "recurrence_end_date", "parent_event_id", "ticket_url", "image_url", "start_time", "end_time", "type_array", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 1, NULL, '2025-10-05 19:00:00+00', '2025-10-05 20:45:00+00', 280, 2400, 'scheduled', '{}', NULL, NULL, NULL, 'https://tickets.example.com/misanthrope-2025-10-05', 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg', '19:00:00', '20:45:00', '{spectacle}', '2025-11-21 00:35:37.135033+00', '2025-11-21 00:35:37.135033+00'),
	(2, 2, NULL, '2026-03-01 20:00:00+00', '2026-03-01 21:50:00+00', 500, 3200, 'scheduled', '{}', NULL, NULL, NULL, 'https://tickets.example.com/tempete-2026-03-01', 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg', '20:00:00', '21:50:00', '{spectacle}', '2025-11-21 00:35:37.135033+00', '2025-11-21 00:35:37.135033+00'),
	(3, 3, NULL, '2025-12-02 20:30:00+00', '2025-12-02 22:30:00+00', 350, 2800, 'scheduled', '{}', NULL, NULL, NULL, 'https://tickets.example.com/rj-2025-12-02', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg', '20:30:00', '22:30:00', '{spectacle}', '2025-11-21 00:35:37.135033+00', '2025-11-21 00:35:37.135033+00'),
	(4, 3, NULL, '2025-12-01 19:30:00+00', '2025-12-01 21:30:00+00', 350, 2800, 'scheduled', '{}', NULL, NULL, NULL, 'https://tickets.example.com/rj-2025-12-01', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg', '19:30:00', '21:30:00', '{spectacle,premiere}', '2025-11-21 00:35:37.135033+00', '2025-11-21 00:35:37.135033+00');


--
-- Data for Name: communiques_presse; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."communiques_presse" ("id", "title", "slug", "description", "date_publication", "image_url", "spectacle_id", "evenement_id", "ordre_affichage", "public", "file_size_bytes", "created_by", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'Nouvelle création 2025', 'nouvelle-creation-2025', 'Annonce officielle de la nouvelle création de la Compagnie Rouge‑Cardinal.', '2025-03-05', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200', NULL, NULL, 10, true, NULL, NULL, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:36.815222+00'),
	(2, 'Tournée printemps 2026', 'tournee-printemps-2026', 'Lancement de la tournée de printemps en France et à l''international.', '2026-03-15', 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200', NULL, NULL, 20, true, NULL, NULL, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:36.815222+00'),
	(3, 'Atelier jeunesse 2025', 'atelier-jeunesse-2025', 'Programme d''ateliers pour le jeune public en partenariat avec des établissements scolaires.', '2025-10-01', 'https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=1200', NULL, NULL, 30, true, NULL, NULL, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:36.815222+00'),
	(4, 'Dossier de presse — La Tempête', 'dossier-presse-tempete-2026', 'Dossier complet pour la presse (photos HD, dossier PDF).', '2026-02-01', 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg', NULL, NULL, 5, true, NULL, NULL, '2025-11-21 00:35:37.135033+00', '2025-11-21 00:35:37.135033+00'),
	(5, 'Communiqué — Le Misanthrope', 'communique-misanthrope-2025', 'Annonce de reprise et calendrier des dates.', '2025-09-10', 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg', NULL, NULL, 15, true, NULL, NULL, '2025-11-21 00:35:37.135033+00', '2025-11-21 00:35:37.135033+00'),
	(6, 'Bilan de saison 2025', 'bilan-saison-2025', 'Retour sur les temps forts et chiffres clés.', '2025-12-31', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg', NULL, NULL, 40, true, NULL, NULL, '2025-11-21 00:35:37.135033+00', '2025-11-21 00:35:37.135033+00'),
	(7, 'Nouveau partenariat 2025', 'partenariat-nouveau-2025', 'Signature d’un partenariat stratégique pour la prochaine saison.', '2025-11-20', 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg', NULL, NULL, 35, true, NULL, NULL, '2025-11-21 00:35:37.135033+00', '2025-11-21 00:35:37.135033+00'),
	(8, 'Nouvelle création : La Tempête de Shakespeare', 'nouvelle-creation-la-tempete-2025', 'La compagnie Rouge Cardinal présente sa nouvelle création : La Tempête de Shakespeare dans une mise en scène contemporaine audacieuse.', '2025-11-06', 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800', NULL, NULL, 1, true, 250880, NULL, '2025-11-21 00:35:38.372722+00', '2025-11-21 00:35:38.372722+00'),
	(9, 'Tournée nationale 2025-2026 : 25 dates confirmées', 'tournee-nationale-2025-2026', 'La compagnie Rouge Cardinal annonce 25 dates de tournée nationale pour la saison 2025-2026.', '2025-10-22', 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800', NULL, NULL, 2, true, 184320, NULL, '2025-11-21 00:35:38.372722+00', '2025-11-21 00:35:38.372722+00'),
	(10, 'Prix du Théâtre Contemporain 2024', 'prix-theatre-contemporain-2024', 'Rouge Cardinal Company remporte le Prix du Théâtre Contemporain 2024 pour "Fragments d''Éternité".', '2025-09-22', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800', NULL, NULL, 3, true, 327680, NULL, '2025-11-21 00:35:38.372722+00', '2025-11-21 00:35:38.372722+00'),
	(11, 'Nouveau partenariat avec la Région Auvergne-Rhône-Alpes', 'partenariat-region-auvergne-rhone-alpes', 'Nouveau partenariat stratégique entre Rouge Cardinal Company et la Région Auvergne-Rhône-Alpes.', '2025-08-23', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', NULL, NULL, 4, true, 199680, NULL, '2025-11-21 00:35:38.372722+00', '2025-11-21 00:35:38.372722+00');


--
-- Data for Name: communiques_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."communiques_categories" ("communique_id", "category_id") VALUES
	(8, 6),
	(9, 7),
	(10, 8),
	(11, 9);


--
-- Data for Name: communiques_medias; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: communiques_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: compagnie_presentation_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."compagnie_presentation_sections" ("id", "slug", "kind", "title", "subtitle", "content", "quote_text", "quote_author", "image_url", "image_media_id", "position", "active", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'hero', 'hero', 'La Compagnie Rouge-Cardinal', '15 ans de passion pour les arts de la scène', NULL, NULL, NULL, NULL, NULL, 5, true, '2025-11-21 00:35:37.392198+00', '2025-11-21 00:35:37.392198+00'),
	(2, 'history', 'history', 'Notre Histoire', NULL, '{"Fondée en 2008 par un collectif de jeunes diplômés des grandes écoles théâtrales françaises, la compagnie Rouge-Cardinal est née d''une envie commune : créer un théâtre qui parle à notre époque tout en puisant dans la richesse du patrimoine dramatique.","Le nom \"Rouge-Cardinal\" évoque à la fois la passion qui nous anime et la noblesse de notre art. Comme le cardinal, oiseau au plumage éclatant, nous cherchons à apporter couleur et vie sur scène.","Depuis nos débuts, nous avons créé plus de 50 spectacles, tourné dans toute la France et à l''étranger, et remporté plusieurs prix prestigieux pour nos créations originales."}', NULL, NULL, 'https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=800', NULL, 20, true, '2025-11-21 00:35:37.392198+00', '2025-11-21 00:35:37.392198+00'),
	(3, 'quote-history', 'quote', NULL, NULL, NULL, 'Le théâtre doit être un miroir de l''âme humaine, un lieu où l''émotion et la réflexion se rencontrent pour créer du sens et du lien entre les êtres.', 'Marie Dubois, Directrice artistique', NULL, NULL, 25, true, '2025-11-21 00:35:37.392198+00', '2025-11-21 00:35:37.392198+00'),
	(4, 'values', 'values', 'Nos Valeurs', 'Les principes qui guident notre travail artistique et notre vision du théâtre', NULL, NULL, NULL, NULL, NULL, 40, true, '2025-11-21 00:35:37.392198+00', '2025-11-21 00:35:37.392198+00'),
	(5, 'team', 'team', 'Notre Équipe', 'Rencontrez les artistes et techniciens qui donnent vie à nos spectacles', NULL, NULL, NULL, NULL, NULL, 50, true, '2025-11-21 00:35:37.392198+00', '2025-11-21 00:35:37.392198+00'),
	(6, 'mission', 'mission', 'Notre Mission', NULL, '{"Créer des spectacles qui émeuvent, questionnent et rassemblent les publics autour de l''art vivant. Nous nous attachons à rendre le théâtre accessible à tous, en développant des projets artistiques de qualité qui résonnent avec les enjeux de notre société.","Notre engagement va au-delà de la simple représentation : nous menons des actions culturelles en milieu scolaire, participons à des festivals, et soutenons la création contemporaine par des résidences d''artistes et des collaborations avec de jeunes talents."}', NULL, NULL, NULL, NULL, 30, true, '2025-11-21 00:35:37.392198+00', '2025-11-21 00:35:37.392198+00');


--
-- Data for Name: compagnie_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."compagnie_stats" ("id", "key", "label", "value", "position", "active", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'spectacles_crees', 'Spectacles créés', '50+', 1, true, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:36.815222+00'),
	(2, 'spectateurs', 'Spectateurs', '25 000+', 2, true, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:36.815222+00'),
	(3, 'annees_experience', 'Années d``expérience', '15+', 3, true, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:36.815222+00'),
	(4, 'prix', 'Prix & distinctions', '7', 4, true, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:36.815222+00');


--
-- Data for Name: compagnie_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."compagnie_values" ("id", "key", "title", "description", "position", "active", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'passion', 'Passion', 'Nous créons avec intensité et sincérité, au service des émotions du public.', 1, true, '2025-11-21 00:35:36.980121+00', '2025-11-21 00:35:36.980121+00'),
	(2, 'collectif', 'Collectif', 'La force du groupe et la diversité des regards nourrissent nos créations.', 2, true, '2025-11-21 00:35:36.980121+00', '2025-11-21 00:35:36.980121+00'),
	(3, 'excellence', 'Excellence', 'Un haut niveau d’exigence artistique et technique guide notre travail.', 3, true, '2025-11-21 00:35:36.980121+00', '2025-11-21 00:35:36.980121+00'),
	(4, 'innovation', 'Innovation', 'Nous explorons de nouvelles formes et technologies pour réinventer la scène.', 4, true, '2025-11-21 00:35:36.980121+00', '2025-11-21 00:35:36.980121+00');


--
-- Data for Name: configurations_site; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."configurations_site" ("key", "value", "updated_at") VALUES
	('site:maintenance_mode', 'false', '2025-11-21 00:35:38.187657+00'),
	('site:version', '"1.0.0"', '2025-11-21 00:35:38.187657+00'),
	('public:home:hero', '{"enabled": true, "autoplay": true, "interval": 5000}', '2025-11-21 00:35:38.187657+00'),
	('public:home:about', '{"enabled": true, "show_stats": true, "show_mission": true}', '2025-11-21 00:35:38.187657+00'),
	('public:home:spectacles', '{"enabled": true, "max_items": 6, "show_archived": false}', '2025-11-21 00:35:38.187657+00'),
	('public:home:news', '{"enabled": true, "max_items": 3, "show_private": false}', '2025-11-21 00:35:38.187657+00'),
	('public:home:newsletter', '{"enabled": true, "double_optin": true, "show_consent": true}', '2025-11-21 00:35:38.187657+00'),
	('public:home:partners', '{"enabled": true, "show_inactive": false}', '2025-11-21 00:35:38.187657+00'),
	('public:contact:enabled', 'true', '2025-11-21 00:35:38.187657+00'),
	('public:contact:reasons', '["booking", "partenariat", "presse", "education", "technique", "autre"]', '2025-11-21 00:35:38.187657+00'),
	('public:contact:require_consent', 'true', '2025-11-21 00:35:38.187657+00'),
	('public:presse:articles_enabled', 'true', '2025-11-21 00:35:38.187657+00'),
	('public:presse:communiques_enabled', 'true', '2025-11-21 00:35:38.187657+00'),
	('public:presse:media_kit_enabled', 'true', '2025-11-21 00:35:38.187657+00'),
	('public:agenda:enabled', 'true', '2025-11-21 00:35:38.187657+00'),
	('public:agenda:show_past_events', 'false', '2025-11-21 00:35:38.187657+00'),
	('public:agenda:max_items', '50', '2025-11-21 00:35:38.187657+00'),
	('public:social:facebook', '{"url": "", "enabled": false}', '2025-11-21 00:35:38.187657+00'),
	('public:social:instagram', '{"url": "", "enabled": false}', '2025-11-21 00:35:38.187657+00'),
	('public:social:youtube', '{"url": "", "enabled": false}', '2025-11-21 00:35:38.187657+00'),
	('public:social:linkedin', '{"url": "", "enabled": false}', '2025-11-21 00:35:38.187657+00'),
	('public:seo:site_name', '"Rouge Cardinal Company"', '2025-11-21 00:35:38.187657+00'),
	('public:seo:default_description', '"Compagnie de théâtre professionnelle créée en 2008, Rouge Cardinal développe un répertoire exigeant mêlant classiques et créations contemporaines."', '2025-11-21 00:35:38.187657+00'),
	('public:seo:default_keywords', '["théâtre", "compagnie", "Rouge Cardinal", "spectacle", "culture", "arts vivants"]', '2025-11-21 00:35:38.187657+00'),
	('app:max_upload_size', '10485760', '2025-11-21 00:35:38.187657+00'),
	('app:allowed_file_types', '["image/jpeg", "image/png", "image/webp", "application/pdf"]', '2025-11-21 00:35:38.187657+00'),
	('app:session_timeout', '7200', '2025-11-21 00:35:38.187657+00'),
	('analytics:google_analytics', '{"enabled": false, "tracking_id": ""}', '2025-11-21 00:35:38.187657+00'),
	('analytics:matomo', '{"url": "", "enabled": false, "site_id": ""}', '2025-11-21 00:35:38.187657+00');


--
-- Data for Name: contacts_presse; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: content_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."content_versions" ("id", "entity_type", "entity_id", "version_number", "content_snapshot", "change_summary", "change_type", "created_at", "created_by") OVERRIDING SYSTEM VALUE VALUES
	(1, 'compagnie_stat', 1, 1, '{"id": 1, "key": "spectacles_crees", "label": "Spectacles créés", "value": "50+", "active": true, "position": 1, "created_at": "2025-11-21T00:35:36.815222+00:00", "updated_at": "2025-11-21T00:35:36.815222+00:00"}', 'Création statistique compagnie: Spectacles créés', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(2, 'compagnie_stat', 2, 1, '{"id": 2, "key": "spectateurs", "label": "Spectateurs", "value": "25 000+", "active": true, "position": 2, "created_at": "2025-11-21T00:35:36.815222+00:00", "updated_at": "2025-11-21T00:35:36.815222+00:00"}', 'Création statistique compagnie: Spectateurs', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(3, 'compagnie_stat', 3, 1, '{"id": 3, "key": "annees_experience", "label": "Années d``expérience", "value": "15+", "active": true, "position": 3, "created_at": "2025-11-21T00:35:36.815222+00:00", "updated_at": "2025-11-21T00:35:36.815222+00:00"}', 'Création statistique compagnie: Années d``expérience', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(4, 'compagnie_stat', 4, 1, '{"id": 4, "key": "prix", "label": "Prix & distinctions", "value": "7", "active": true, "position": 4, "created_at": "2025-11-21T00:35:36.815222+00:00", "updated_at": "2025-11-21T00:35:36.815222+00:00"}', 'Création statistique compagnie: Prix & distinctions', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(5, 'communique_presse', 1, 1, '{"id": 1, "slug": "nouvelle-creation-2025", "title": "Nouvelle création 2025", "public": true, "image_url": "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:36.815222+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:36.815222+00:00", "description": "Annonce officielle de la nouvelle création de la Compagnie Rouge‑Cardinal.", "evenement_id": null, "spectacle_id": null, "file_size_bytes": null, "ordre_affichage": 10, "date_publication": "2025-03-05"}', 'Création du communiqué: Nouvelle création 2025', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(6, 'communique_presse', 2, 1, '{"id": 2, "slug": "tournee-printemps-2026", "title": "Tournée printemps 2026", "public": true, "image_url": "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:36.815222+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:36.815222+00:00", "description": "Lancement de la tournée de printemps en France et à l''international.", "evenement_id": null, "spectacle_id": null, "file_size_bytes": null, "ordre_affichage": 20, "date_publication": "2026-03-15"}', 'Création du communiqué: Tournée printemps 2026', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(7, 'communique_presse', 3, 1, '{"id": 3, "slug": "atelier-jeunesse-2025", "title": "Atelier jeunesse 2025", "public": true, "image_url": "https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:36.815222+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:36.815222+00:00", "description": "Programme d''ateliers pour le jeune public en partenariat avec des établissements scolaires.", "evenement_id": null, "spectacle_id": null, "file_size_bytes": null, "ordre_affichage": 30, "date_publication": "2025-10-01"}', 'Création du communiqué: Atelier jeunesse 2025', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(8, 'partner', 1, 1, '{"id": 1, "name": "Théâtre des Champs-Élysées", "logo_url": "https://dummyimage.com/300x150/000/fff&text=Theatre+CE", "is_active": true, "created_at": "2025-11-21T00:35:36.815222+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:36.815222+00:00", "description": "Partenaire scène.", "website_url": "https://www.theatrechampselysees.fr", "display_order": 30, "logo_media_id": null}', 'Création partenaire: Théâtre des Champs-Élysées', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(9, 'partner', 2, 1, '{"id": 2, "name": "Ville de Paris", "logo_url": "https://dummyimage.com/300x150/000/fff&text=Ville+de+Paris", "is_active": true, "created_at": "2025-11-21T00:35:36.815222+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:36.815222+00:00", "description": "Soutien institutionnel à la création et à la diffusion.", "website_url": "https://www.paris.fr", "display_order": 10, "logo_media_id": null}', 'Création partenaire: Ville de Paris', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(10, 'partner', 3, 1, '{"id": 3, "name": "Ministère de la Culture", "logo_url": "https://dummyimage.com/300x150/000/fff&text=Ministere", "is_active": true, "created_at": "2025-11-21T00:35:36.815222+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:36.815222+00:00", "description": "Partenaire culturel national.", "website_url": "https://www.culture.gouv.fr", "display_order": 20, "logo_media_id": null}', 'Création partenaire: Ministère de la Culture', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(11, 'spectacle', 1, 1, '{"id": 1, "slug": "le-misanthrope", "genre": "comedie", "title": "Le Misanthrope", "awards": null, "public": true, "status": "actuellement", "casting": 6, "premiere": "2025-09-30T20:00:00+00:00", "image_url": "https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg", "created_at": "2025-11-21T00:35:36.815222+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:36.815222+00:00", "description": "Satire mordante des mœurs et des hypocrisies sociales.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 105, "meta_description": null, "og_image_media_id": null, "short_description": "Molière en version incisive et moderne."}', 'Création du spectacle: Le Misanthrope', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(12, 'spectacle', 2, 1, '{"id": 2, "slug": "la-tempete", "genre": "Drame", "title": "La Tempête", "awards": null, "public": true, "status": "actuellement", "casting": 7, "premiere": "2026-02-20T20:00:00+00:00", "image_url": "https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg", "created_at": "2025-11-21T00:35:36.815222+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:36.815222+00:00", "description": "Magie, pouvoir et rédemption sur une île mystérieuse.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 110, "meta_description": null, "og_image_media_id": null, "short_description": "Un conte envoûtant entre illusion et réalité."}', 'Création du spectacle: La Tempête', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(13, 'spectacle', 3, 1, '{"id": 3, "slug": "romeo-et-juliette", "genre": "Drame", "title": "Roméo et Juliette", "awards": null, "public": true, "status": "actuellement", "casting": 8, "premiere": "2025-11-15T20:00:00+00:00", "image_url": "https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg", "created_at": "2025-11-21T00:35:36.815222+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:36.815222+00:00", "description": "Réinterprétation contemporaine du classique de Shakespeare.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 120, "meta_description": null, "og_image_media_id": null, "short_description": "Une fresque amoureuse et tragique revisitée."}', 'Création du spectacle: Roméo et Juliette', 'create', '2025-11-21 00:35:36.815222+00', NULL),
	(14, 'compagnie_value', 1, 1, '{"id": 1, "key": "passion", "title": "Passion", "active": true, "position": 1, "created_at": "2025-11-21T00:35:36.980121+00:00", "updated_at": "2025-11-21T00:35:36.980121+00:00", "description": "Nous créons avec intensité et sincérité, au service des émotions du public."}', 'Création valeur compagnie: Passion', 'create', '2025-11-21 00:35:36.980121+00', NULL),
	(15, 'compagnie_value', 2, 1, '{"id": 2, "key": "collectif", "title": "Collectif", "active": true, "position": 2, "created_at": "2025-11-21T00:35:36.980121+00:00", "updated_at": "2025-11-21T00:35:36.980121+00:00", "description": "La force du groupe et la diversité des regards nourrissent nos créations."}', 'Création valeur compagnie: Collectif', 'create', '2025-11-21 00:35:36.980121+00', NULL),
	(16, 'compagnie_value', 3, 1, '{"id": 3, "key": "excellence", "title": "Excellence", "active": true, "position": 3, "created_at": "2025-11-21T00:35:36.980121+00:00", "updated_at": "2025-11-21T00:35:36.980121+00:00", "description": "Un haut niveau d’exigence artistique et technique guide notre travail."}', 'Création valeur compagnie: Excellence', 'create', '2025-11-21 00:35:36.980121+00', NULL),
	(17, 'compagnie_value', 4, 1, '{"id": 4, "key": "innovation", "title": "Innovation", "active": true, "position": 4, "created_at": "2025-11-21T00:35:36.980121+00:00", "updated_at": "2025-11-21T00:35:36.980121+00:00", "description": "Nous explorons de nouvelles formes et technologies pour réinventer la scène."}', 'Création valeur compagnie: Innovation', 'create', '2025-11-21 00:35:36.980121+00', NULL),
	(18, 'evenement', 1, 1, '{"id": 1, "status": "scheduled", "lieu_id": null, "capacity": 280, "date_fin": "2025-10-05T20:45:00+00:00", "end_time": "20:45:00", "metadata": {}, "image_url": "https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg", "created_at": "2025-11-21T00:35:37.135033+00:00", "date_debut": "2025-10-05T19:00:00+00:00", "start_time": "19:00:00", "ticket_url": "https://tickets.example.com/misanthrope-2025-10-05", "type_array": ["spectacle"], "updated_at": "2025-11-21T00:35:37.135033+00:00", "price_cents": 2400, "spectacle_id": 1, "parent_event_id": null, "recurrence_rule": null, "recurrence_end_date": null}', 'Création d''événement pour: Le Misanthrope', 'create', '2025-11-21 00:35:37.135033+00', NULL),
	(19, 'evenement', 2, 1, '{"id": 2, "status": "scheduled", "lieu_id": null, "capacity": 500, "date_fin": "2026-03-01T21:50:00+00:00", "end_time": "21:50:00", "metadata": {}, "image_url": "https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg", "created_at": "2025-11-21T00:35:37.135033+00:00", "date_debut": "2026-03-01T20:00:00+00:00", "start_time": "20:00:00", "ticket_url": "https://tickets.example.com/tempete-2026-03-01", "type_array": ["spectacle"], "updated_at": "2025-11-21T00:35:37.135033+00:00", "price_cents": 3200, "spectacle_id": 2, "parent_event_id": null, "recurrence_rule": null, "recurrence_end_date": null}', 'Création d''événement pour: La Tempête', 'create', '2025-11-21 00:35:37.135033+00', NULL),
	(20, 'evenement', 3, 1, '{"id": 3, "status": "scheduled", "lieu_id": null, "capacity": 350, "date_fin": "2025-12-02T22:30:00+00:00", "end_time": "22:30:00", "metadata": {}, "image_url": "https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg", "created_at": "2025-11-21T00:35:37.135033+00:00", "date_debut": "2025-12-02T20:30:00+00:00", "start_time": "20:30:00", "ticket_url": "https://tickets.example.com/rj-2025-12-02", "type_array": ["spectacle"], "updated_at": "2025-11-21T00:35:37.135033+00:00", "price_cents": 2800, "spectacle_id": 3, "parent_event_id": null, "recurrence_rule": null, "recurrence_end_date": null}', 'Création d''événement pour: Roméo et Juliette', 'create', '2025-11-21 00:35:37.135033+00', NULL),
	(21, 'evenement', 4, 1, '{"id": 4, "status": "scheduled", "lieu_id": null, "capacity": 350, "date_fin": "2025-12-01T21:30:00+00:00", "end_time": "21:30:00", "metadata": {}, "image_url": "https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg", "created_at": "2025-11-21T00:35:37.135033+00:00", "date_debut": "2025-12-01T19:30:00+00:00", "start_time": "19:30:00", "ticket_url": "https://tickets.example.com/rj-2025-12-01", "type_array": ["spectacle", "premiere"], "updated_at": "2025-11-21T00:35:37.135033+00:00", "price_cents": 2800, "spectacle_id": 3, "parent_event_id": null, "recurrence_rule": null, "recurrence_end_date": null}', 'Création d''événement pour: Roméo et Juliette', 'create', '2025-11-21 00:35:37.135033+00', NULL),
	(22, 'communique_presse', 4, 1, '{"id": 4, "slug": "dossier-presse-tempete-2026", "title": "Dossier de presse — La Tempête", "public": true, "image_url": "https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg", "created_at": "2025-11-21T00:35:37.135033+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:37.135033+00:00", "description": "Dossier complet pour la presse (photos HD, dossier PDF).", "evenement_id": null, "spectacle_id": null, "file_size_bytes": null, "ordre_affichage": 5, "date_publication": "2026-02-01"}', 'Création du communiqué: Dossier de presse — La Tempête', 'create', '2025-11-21 00:35:37.135033+00', NULL),
	(23, 'communique_presse', 5, 1, '{"id": 5, "slug": "communique-misanthrope-2025", "title": "Communiqué — Le Misanthrope", "public": true, "image_url": "https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg", "created_at": "2025-11-21T00:35:37.135033+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:37.135033+00:00", "description": "Annonce de reprise et calendrier des dates.", "evenement_id": null, "spectacle_id": null, "file_size_bytes": null, "ordre_affichage": 15, "date_publication": "2025-09-10"}', 'Création du communiqué: Communiqué — Le Misanthrope', 'create', '2025-11-21 00:35:37.135033+00', NULL),
	(24, 'communique_presse', 6, 1, '{"id": 6, "slug": "bilan-saison-2025", "title": "Bilan de saison 2025", "public": true, "image_url": "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg", "created_at": "2025-11-21T00:35:37.135033+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:37.135033+00:00", "description": "Retour sur les temps forts et chiffres clés.", "evenement_id": null, "spectacle_id": null, "file_size_bytes": null, "ordre_affichage": 40, "date_publication": "2025-12-31"}', 'Création du communiqué: Bilan de saison 2025', 'create', '2025-11-21 00:35:37.135033+00', NULL),
	(25, 'communique_presse', 7, 1, '{"id": 7, "slug": "partenariat-nouveau-2025", "title": "Nouveau partenariat 2025", "public": true, "image_url": "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg", "created_at": "2025-11-21T00:35:37.135033+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:37.135033+00:00", "description": "Signature d’un partenariat stratégique pour la prochaine saison.", "evenement_id": null, "spectacle_id": null, "file_size_bytes": null, "ordre_affichage": 35, "date_publication": "2025-11-20"}', 'Création du communiqué: Nouveau partenariat 2025', 'create', '2025-11-21 00:35:37.135033+00', NULL),
	(26, 'article_presse', 1, 1, '{"id": 1, "slug": "critique-romeo-juliette-telerama", "type": "critique", "chapo": "Un spectacle incandescent porté par une troupe vibrante.", "title": "Réinvention ardente de Roméo et Juliette", "author": "Camille Martin", "excerpt": "Une lecture contemporaine qui assume ses audaces, sans trahir l’émotion originelle.", "keywords": null, "created_at": "2025-11-21T00:35:37.135033+00:00", "meta_title": null, "source_url": "https://www.telerama.fr/sortir/critique-romeo-juliette", "updated_at": "2025-11-21T00:35:37.135033+00:00", "schema_type": "Article", "published_at": "2025-12-02T08:00:00+00:00", "canonical_url": null, "search_vector": null, "meta_description": null, "og_image_media_id": null, "source_publication": "Télérama"}', 'Création de l''article: Réinvention ardente de Roméo et Juliette', 'create', '2025-11-21 00:35:37.135033+00', NULL),
	(27, 'article_presse', 2, 1, '{"id": 2, "slug": "la-tempete-lemonde-chronique", "type": "chronique", "chapo": "Une proposition visuelle puissante, servie par une direction d’acteurs précise.", "title": "La Tempête, entre sortilèges et douceur", "author": "Hugo Bernard", "excerpt": "Le plateau devient carte des vents, les corps dessinent l’orage.", "keywords": null, "created_at": "2025-11-21T00:35:37.135033+00:00", "meta_title": null, "source_url": "https://www.lemonde.fr/culture/article/2026/03/02/la-tempete", "updated_at": "2025-11-21T00:35:37.135033+00:00", "schema_type": "Article", "published_at": "2026-03-02T07:30:00+00:00", "canonical_url": null, "search_vector": null, "meta_description": null, "og_image_media_id": null, "source_publication": "Le Monde"}', 'Création de l''article: La Tempête, entre sortilèges et douceur', 'create', '2025-11-21 00:35:37.135033+00', NULL),
	(28, 'article_presse', 3, 1, '{"id": 3, "slug": "misanthrope-liberation-entretien", "type": "entretien", "chapo": "Un dialogue sur la misanthropie contemporaine et ses ambiguïtés.", "title": "Entretien: la franchise de Molière aujourd’hui", "author": "Julie Rey", "excerpt": "Entre satire et tendresse, la mise à nu des relations.", "keywords": null, "created_at": "2025-11-21T00:35:37.135033+00:00", "meta_title": null, "source_url": "https://www.liberation.fr/culture/theatre/misanthrope", "updated_at": "2025-11-21T00:35:37.135033+00:00", "schema_type": "Article", "published_at": "2025-10-06T10:15:00+00:00", "canonical_url": null, "search_vector": null, "meta_description": null, "og_image_media_id": null, "source_publication": "Libération"}', 'Création de l''article: Entretien: la franchise de Molière aujourd’hui', 'create', '2025-11-21 00:35:37.135033+00', NULL),
	(29, 'membre_equipe', 1, 1, '{"id": 1, "name": "Léa Robert", "role": "Scénographe", "ordre": 50, "active": true, "image_url": "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg", "created_at": "2025-11-21T00:35:37.270223+00:00", "updated_at": "2025-11-21T00:35:37.270223+00:00", "description": "Conçoit des espaces évocateurs pour une immersion poétique du public.", "photo_media_id": null}', 'Création membre équipe: Léa Robert', 'create', '2025-11-21 00:35:37.270223+00', NULL),
	(30, 'membre_equipe', 2, 1, '{"id": 2, "name": "Anne Dupont", "role": "Directrice artistique", "ordre": 10, "active": true, "image_url": "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg", "created_at": "2025-11-21T00:35:37.270223+00:00", "updated_at": "2025-11-21T00:35:37.270223+00:00", "description": "Fondatrice de la compagnie, elle dirige la vision artistique et la dramaturgie des créations.", "photo_media_id": null}', 'Création membre équipe: Anne Dupont', 'create', '2025-11-21 00:35:37.270223+00', NULL),
	(31, 'membre_equipe', 3, 1, '{"id": 3, "name": "Marc Leroy", "role": "Metteur en scène", "ordre": 20, "active": true, "image_url": "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg", "created_at": "2025-11-21T00:35:37.270223+00:00", "updated_at": "2025-11-21T00:35:37.270223+00:00", "description": "Explore des formes scéniques contemporaines, au croisement du texte et du mouvement.", "photo_media_id": null}', 'Création membre équipe: Marc Leroy', 'create', '2025-11-21 00:35:37.270223+00', NULL),
	(32, 'membre_equipe', 4, 1, '{"id": 4, "name": "Hugo Martin", "role": "Chargé de production", "ordre": 40, "active": true, "image_url": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg", "created_at": "2025-11-21T00:35:37.270223+00:00", "updated_at": "2025-11-21T00:35:37.270223+00:00", "description": "Coordonne la production, les tournées et les partenariats institutionnels.", "photo_media_id": null}', 'Création membre équipe: Hugo Martin', 'create', '2025-11-21 00:35:37.270223+00', NULL),
	(33, 'membre_equipe', 5, 1, '{"id": 5, "name": "Sara Benali", "role": "Comédienne", "ordre": 30, "active": true, "image_url": "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg", "created_at": "2025-11-21T00:35:37.270223+00:00", "updated_at": "2025-11-21T00:35:37.270223+00:00", "description": "Interprète principale sur plusieurs productions, portée par un jeu sensible et physique.", "photo_media_id": null}', 'Création membre équipe: Sara Benali', 'create', '2025-11-21 00:35:37.270223+00', NULL),
	(34, 'compagnie_presentation_section', 1, 1, '{"id": 1, "kind": "hero", "slug": "hero", "title": "La Compagnie Rouge-Cardinal", "active": true, "content": null, "position": 5, "subtitle": "15 ans de passion pour les arts de la scène", "image_url": null, "created_at": "2025-11-21T00:35:37.392198+00:00", "quote_text": null, "updated_at": "2025-11-21T00:35:37.392198+00:00", "quote_author": null, "image_media_id": null}', 'Création section présentation: hero', 'create', '2025-11-21 00:35:37.392198+00', NULL),
	(35, 'compagnie_presentation_section', 2, 1, '{"id": 2, "kind": "history", "slug": "history", "title": "Notre Histoire", "active": true, "content": ["Fondée en 2008 par un collectif de jeunes diplômés des grandes écoles théâtrales françaises, la compagnie Rouge-Cardinal est née d''une envie commune : créer un théâtre qui parle à notre époque tout en puisant dans la richesse du patrimoine dramatique.", "Le nom \"Rouge-Cardinal\" évoque à la fois la passion qui nous anime et la noblesse de notre art. Comme le cardinal, oiseau au plumage éclatant, nous cherchons à apporter couleur et vie sur scène.", "Depuis nos débuts, nous avons créé plus de 50 spectacles, tourné dans toute la France et à l''étranger, et remporté plusieurs prix prestigieux pour nos créations originales."], "position": 20, "subtitle": null, "image_url": "https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=800", "created_at": "2025-11-21T00:35:37.392198+00:00", "quote_text": null, "updated_at": "2025-11-21T00:35:37.392198+00:00", "quote_author": null, "image_media_id": null}', 'Création section présentation: history', 'create', '2025-11-21 00:35:37.392198+00', NULL),
	(36, 'compagnie_presentation_section', 3, 1, '{"id": 3, "kind": "quote", "slug": "quote-history", "title": null, "active": true, "content": null, "position": 25, "subtitle": null, "image_url": null, "created_at": "2025-11-21T00:35:37.392198+00:00", "quote_text": "Le théâtre doit être un miroir de l''âme humaine, un lieu où l''émotion et la réflexion se rencontrent pour créer du sens et du lien entre les êtres.", "updated_at": "2025-11-21T00:35:37.392198+00:00", "quote_author": "Marie Dubois, Directrice artistique", "image_media_id": null}', 'Création section présentation: quote-history', 'create', '2025-11-21 00:35:37.392198+00', NULL),
	(37, 'compagnie_presentation_section', 4, 1, '{"id": 4, "kind": "values", "slug": "values", "title": "Nos Valeurs", "active": true, "content": null, "position": 40, "subtitle": "Les principes qui guident notre travail artistique et notre vision du théâtre", "image_url": null, "created_at": "2025-11-21T00:35:37.392198+00:00", "quote_text": null, "updated_at": "2025-11-21T00:35:37.392198+00:00", "quote_author": null, "image_media_id": null}', 'Création section présentation: values', 'create', '2025-11-21 00:35:37.392198+00', NULL),
	(38, 'compagnie_presentation_section', 5, 1, '{"id": 5, "kind": "team", "slug": "team", "title": "Notre Équipe", "active": true, "content": null, "position": 50, "subtitle": "Rencontrez les artistes et techniciens qui donnent vie à nos spectacles", "image_url": null, "created_at": "2025-11-21T00:35:37.392198+00:00", "quote_text": null, "updated_at": "2025-11-21T00:35:37.392198+00:00", "quote_author": null, "image_media_id": null}', 'Création section présentation: team', 'create', '2025-11-21 00:35:37.392198+00', NULL),
	(39, 'compagnie_presentation_section', 6, 1, '{"id": 6, "kind": "mission", "slug": "mission", "title": "Notre Mission", "active": true, "content": ["Créer des spectacles qui émeuvent, questionnent et rassemblent les publics autour de l''art vivant. Nous nous attachons à rendre le théâtre accessible à tous, en développant des projets artistiques de qualité qui résonnent avec les enjeux de notre société.", "Notre engagement va au-delà de la simple représentation : nous menons des actions culturelles en milieu scolaire, participons à des festivals, et soutenons la création contemporaine par des résidences d''artistes et des collaborations avec de jeunes talents."], "position": 30, "subtitle": null, "image_url": null, "created_at": "2025-11-21T00:35:37.392198+00:00", "quote_text": null, "updated_at": "2025-11-21T00:35:37.392198+00:00", "quote_author": null, "image_media_id": null}', 'Création section présentation: mission', 'create', '2025-11-21 00:35:37.392198+00', NULL),
	(40, 'spectacle', 4, 1, '{"id": 4, "slug": "les-murmures-du-temps", "genre": "Drame contemporain", "title": "Les Murmures du Temps", "awards": ["Nominé aux Molières 2024"], "public": true, "status": "actuellement", "casting": 4, "premiere": "2023-10-15T18:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Un voyage poétique à travers les âges, où passé et présent se rencontrent dans un dialogue bouleversant. Cette création originale explore les liens invisibles qui nous unissent à travers le temps.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 90, "meta_description": null, "og_image_media_id": null, "short_description": "Voyage poétique entre passé et présent."}', 'Création du spectacle: Les Murmures du Temps', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(41, 'spectacle', 5, 1, '{"id": 5, "slug": "fragments-d-eternite", "genre": "Création originale", "title": "Fragments d''Éternité", "awards": null, "public": true, "status": "actuellement", "casting": 6, "premiere": "2024-01-12T19:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Une création originale qui explore les liens invisibles qui nous unissent, entre rire et larmes. Un spectacle touchant sur la condition humaine et nos quêtes de sens.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 105, "meta_description": null, "og_image_media_id": null, "short_description": "Création originale sur les liens invisibles."}', 'Création du spectacle: Fragments d''Éternité', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(42, 'spectacle', 6, 1, '{"id": 6, "slug": "la-danse-des-ombres", "genre": "Classique revisité", "title": "La Danse des Ombres", "awards": ["Prix du Public - Festival d''Avignon"], "public": true, "status": "archive", "casting": 5, "premiere": "2023-05-10T18:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Adaptation moderne d''un classique, revisité avec audace et sensibilité par notre équipe artistique.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 95, "meta_description": null, "og_image_media_id": null, "short_description": "Classique revisité avec audace."}', 'Création du spectacle: La Danse des Ombres', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(43, 'spectacle', 7, 1, '{"id": 7, "slug": "echos-de-liberte", "genre": "Théâtre documentaire", "title": "Échos de Liberté", "awards": ["Mention spéciale - Théâtre et Société"], "public": true, "status": "archive", "casting": 4, "premiere": "2022-03-18T19:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Un spectacle engagé sur les droits humains et la liberté d''expression dans le monde contemporain.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 100, "meta_description": null, "og_image_media_id": null, "short_description": "Spectacle engagé sur les droits humains."}', 'Création du spectacle: Échos de Liberté', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(44, 'spectacle', 8, 1, '{"id": 8, "slug": "reves-d-enfance", "genre": "Tout public", "title": "Rêves d''Enfance", "awards": null, "public": true, "status": "archive", "casting": 3, "premiere": "2021-11-02T18:00:00+00:00", "image_url": "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Un spectacle familial poétique qui ravive la magie de l''enfance chez petits et grands.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 80, "meta_description": null, "og_image_media_id": null, "short_description": "Spectacle familial poétique."}', 'Création du spectacle: Rêves d''Enfance', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(53, 'communique_presse', 8, 1, '{"id": 8, "slug": "nouvelle-creation-la-tempete-2025", "title": "Nouvelle création : La Tempête de Shakespeare", "public": true, "image_url": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800", "created_at": "2025-11-21T00:35:38.372722+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:38.372722+00:00", "description": "La compagnie Rouge Cardinal présente sa nouvelle création : La Tempête de Shakespeare dans une mise en scène contemporaine audacieuse.", "evenement_id": null, "spectacle_id": null, "file_size_bytes": 250880, "ordre_affichage": 1, "date_publication": "2025-11-06"}', 'Création du communiqué: Nouvelle création : La Tempête de Shakespeare', 'create', '2025-11-21 00:35:38.372722+00', NULL),
	(45, 'spectacle', 9, 1, '{"id": 9, "slug": "solitudes-partagees", "genre": "Drame psychologique", "title": "Solitudes Partagées", "awards": ["Prix de la Critique"], "public": true, "status": "archive", "casting": 2, "premiere": "2020-09-25T18:00:00+00:00", "image_url": "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Une réflexion intimiste sur la solitude moderne et les moyens de créer du lien dans notre société.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 110, "meta_description": null, "og_image_media_id": null, "short_description": "Réflexion intimiste sur la solitude."}', 'Création du spectacle: Solitudes Partagées', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(46, 'spectacle', 10, 1, '{"id": 10, "slug": "memoires-de-guerre", "genre": "Théâtre historique", "title": "Mémoires de Guerre", "awards": ["Grand Prix du Jury - Festival de Nancy"], "public": true, "status": "archive", "casting": 6, "premiere": "2019-11-11T19:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184396/pexels-photo-3184396.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Un témoignage bouleversant sur les survivants de guerre et la transmission de la mémoire.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 120, "meta_description": null, "og_image_media_id": null, "short_description": "Témoignage sur la mémoire de guerre."}', 'Création du spectacle: Mémoires de Guerre', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(47, 'spectacle', 11, 1, '{"id": 11, "slug": "les-voix-du-silence", "genre": "Théâtre social", "title": "Les Voix du Silence", "awards": ["Prix de l''Innovation Sociale"], "public": true, "status": "archive", "casting": 5, "premiere": "2019-06-15T18:00:00+00:00", "image_url": "https://images.pexels.com/photos/3184327/pexels-photo-3184327.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Spectacle inclusif donnant la parole aux personnes sourdes et malentendantes.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 85, "meta_description": null, "og_image_media_id": null, "short_description": "Spectacle inclusif sur la surdité."}', 'Création du spectacle: Les Voix du Silence', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(48, 'spectacle', 12, 1, '{"id": 12, "slug": "nuit-blanche-a-paris", "genre": "Comédie", "title": "Nuit Blanche à Paris", "awards": null, "public": true, "status": "archive", "casting": 4, "premiere": "2018-12-20T19:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184354/pexels-photo-3184354.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Une comédie romantique pleine de rebondissements dans les rues de la capitale.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 95, "meta_description": null, "og_image_media_id": null, "short_description": "Comédie romantique parisienne."}', 'Création du spectacle: Nuit Blanche à Paris', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(49, 'spectacle', 13, 1, '{"id": 13, "slug": "l-appel-de-la-foret", "genre": "Aventure dramatique", "title": "L''Appel de la Forêt", "awards": ["Coup de Cœur du Public"], "public": true, "status": "archive", "casting": 3, "premiere": "2018-03-22T19:00:00+00:00", "image_url": "https://images.pexels.com/photos/3184372/pexels-photo-3184372.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Adaptation théâtrale du chef-d''œuvre de Jack London, entre aventure et introspection.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 105, "meta_description": null, "og_image_media_id": null, "short_description": "Adaptation de Jack London."}', 'Création du spectacle: L''Appel de la Forêt', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(50, 'spectacle', 14, 1, '{"id": 14, "slug": "portraits-de-famille", "genre": "Drame familial", "title": "Portraits de Famille", "awards": ["Prix de la Meilleure Interprétation Féminine"], "public": true, "status": "archive", "casting": 7, "premiere": "2017-10-05T18:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184387/pexels-photo-3184387.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Une chronique familiale touchante sur trois générations de femmes.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 115, "meta_description": null, "og_image_media_id": null, "short_description": "Chronique familiale sur trois générations."}', 'Création du spectacle: Portraits de Famille', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(51, 'spectacle', 15, 1, '{"id": 15, "slug": "renaissance", "genre": "Comédie musicale", "title": "Renaissance", "awards": null, "public": true, "status": "archive", "casting": 8, "premiere": "2017-04-18T17:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184445/pexels-photo-3184445.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Un spectacle musical célébrant la renaissance culturelle après les temps difficiles.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 130, "meta_description": null, "og_image_media_id": null, "short_description": "Spectacle musical sur la renaissance."}', 'Création du spectacle: Renaissance', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(52, 'spectacle', 16, 1, '{"id": 16, "slug": "les-chemins-de-traverse", "genre": "Drame contemporain", "title": "Les Chemins de Traverse", "awards": ["Révélation de l''Année"], "public": true, "status": "archive", "casting": 4, "premiere": "2016-09-12T18:00:00+00:00", "image_url": "https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:37.797667+00:00", "description": "Un road-movie théâtral sur la quête d''identité et les rencontres qui changent une vie.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 100, "meta_description": null, "og_image_media_id": null, "short_description": "Road-movie théâtral."}', 'Création du spectacle: Les Chemins de Traverse', 'create', '2025-11-21 00:35:37.797667+00', NULL),
	(54, 'communique_presse', 9, 1, '{"id": 9, "slug": "tournee-nationale-2025-2026", "title": "Tournée nationale 2025-2026 : 25 dates confirmées", "public": true, "image_url": "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800", "created_at": "2025-11-21T00:35:38.372722+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:38.372722+00:00", "description": "La compagnie Rouge Cardinal annonce 25 dates de tournée nationale pour la saison 2025-2026.", "evenement_id": null, "spectacle_id": null, "file_size_bytes": 184320, "ordre_affichage": 2, "date_publication": "2025-10-22"}', 'Création du communiqué: Tournée nationale 2025-2026 : 25 dates confirmées', 'create', '2025-11-21 00:35:38.372722+00', NULL),
	(55, 'communique_presse', 10, 1, '{"id": 10, "slug": "prix-theatre-contemporain-2024", "title": "Prix du Théâtre Contemporain 2024", "public": true, "image_url": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800", "created_at": "2025-11-21T00:35:38.372722+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:38.372722+00:00", "description": "Rouge Cardinal Company remporte le Prix du Théâtre Contemporain 2024 pour \"Fragments d''Éternité\".", "evenement_id": null, "spectacle_id": null, "file_size_bytes": 327680, "ordre_affichage": 3, "date_publication": "2025-09-22"}', 'Création du communiqué: Prix du Théâtre Contemporain 2024', 'create', '2025-11-21 00:35:38.372722+00', NULL),
	(56, 'communique_presse', 11, 1, '{"id": 11, "slug": "partenariat-region-auvergne-rhone-alpes", "title": "Nouveau partenariat avec la Région Auvergne-Rhône-Alpes", "public": true, "image_url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800", "created_at": "2025-11-21T00:35:38.372722+00:00", "created_by": null, "updated_at": "2025-11-21T00:35:38.372722+00:00", "description": "Nouveau partenariat stratégique entre Rouge Cardinal Company et la Région Auvergne-Rhône-Alpes.", "evenement_id": null, "spectacle_id": null, "file_size_bytes": 199680, "ordre_affichage": 4, "date_publication": "2025-08-23"}', 'Création du communiqué: Nouveau partenariat avec la Région Auvergne-Rhône-Alpes', 'create', '2025-11-21 00:35:38.372722+00', NULL),
	(57, 'spectacle', 1, 2, '{"id": 1, "slug": "le-misanthrope", "genre": "comedie", "title": "Le Misanthrope", "awards": null, "public": true, "status": "actuellement", "casting": 6, "premiere": "2025-09-30T20:00:00+00:00", "image_url": "https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg", "created_at": "2025-11-21T00:35:36.815222+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Satire mordante des mœurs et des hypocrisies sociales.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 105, "meta_description": null, "og_image_media_id": null, "short_description": "Molière en version incisive et moderne."}', 'Mise à jour du spectacle: Le Misanthrope', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(58, 'spectacle', 2, 2, '{"id": 2, "slug": "la-tempete", "genre": "Drame", "title": "La Tempête", "awards": null, "public": true, "status": "actuellement", "casting": 7, "premiere": "2026-02-20T20:00:00+00:00", "image_url": "https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg", "created_at": "2025-11-21T00:35:36.815222+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Magie, pouvoir et rédemption sur une île mystérieuse.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 110, "meta_description": null, "og_image_media_id": null, "short_description": "Un conte envoûtant entre illusion et réalité."}', 'Mise à jour du spectacle: La Tempête', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(59, 'spectacle', 3, 2, '{"id": 3, "slug": "romeo-et-juliette", "genre": "Drame", "title": "Roméo et Juliette", "awards": null, "public": true, "status": "actuellement", "casting": 8, "premiere": "2025-11-15T20:00:00+00:00", "image_url": "https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg", "created_at": "2025-11-21T00:35:36.815222+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Réinterprétation contemporaine du classique de Shakespeare.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 120, "meta_description": null, "og_image_media_id": null, "short_description": "Une fresque amoureuse et tragique revisitée."}', 'Mise à jour du spectacle: Roméo et Juliette', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(60, 'spectacle', 4, 2, '{"id": 4, "slug": "les-murmures-du-temps", "genre": "Drame contemporain", "title": "Les Murmures du Temps", "awards": ["Nominé aux Molières 2024"], "public": true, "status": "actuellement", "casting": 4, "premiere": "2023-10-15T18:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Un voyage poétique à travers les âges, où passé et présent se rencontrent dans un dialogue bouleversant. Cette création originale explore les liens invisibles qui nous unissent à travers le temps.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 90, "meta_description": null, "og_image_media_id": null, "short_description": "Voyage poétique entre passé et présent."}', 'Mise à jour du spectacle: Les Murmures du Temps', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(61, 'spectacle', 5, 2, '{"id": 5, "slug": "fragments-d-eternite", "genre": "Création originale", "title": "Fragments d''Éternité", "awards": null, "public": true, "status": "actuellement", "casting": 6, "premiere": "2024-01-12T19:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Une création originale qui explore les liens invisibles qui nous unissent, entre rire et larmes. Un spectacle touchant sur la condition humaine et nos quêtes de sens.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 105, "meta_description": null, "og_image_media_id": null, "short_description": "Création originale sur les liens invisibles."}', 'Mise à jour du spectacle: Fragments d''Éternité', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(62, 'spectacle', 6, 2, '{"id": 6, "slug": "la-danse-des-ombres", "genre": "Classique revisité", "title": "La Danse des Ombres", "awards": ["Prix du Public - Festival d''Avignon"], "public": true, "status": "archive", "casting": 5, "premiere": "2023-05-10T18:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Adaptation moderne d''un classique, revisité avec audace et sensibilité par notre équipe artistique.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 95, "meta_description": null, "og_image_media_id": null, "short_description": "Classique revisité avec audace."}', 'Mise à jour du spectacle: La Danse des Ombres', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(63, 'spectacle', 7, 2, '{"id": 7, "slug": "echos-de-liberte", "genre": "Théâtre documentaire", "title": "Échos de Liberté", "awards": ["Mention spéciale - Théâtre et Société"], "public": true, "status": "archive", "casting": 4, "premiere": "2022-03-18T19:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Un spectacle engagé sur les droits humains et la liberté d''expression dans le monde contemporain.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 100, "meta_description": null, "og_image_media_id": null, "short_description": "Spectacle engagé sur les droits humains."}', 'Mise à jour du spectacle: Échos de Liberté', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(64, 'spectacle', 8, 2, '{"id": 8, "slug": "reves-d-enfance", "genre": "Tout public", "title": "Rêves d''Enfance", "awards": null, "public": true, "status": "archive", "casting": 3, "premiere": "2021-11-02T18:00:00+00:00", "image_url": "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Un spectacle familial poétique qui ravive la magie de l''enfance chez petits et grands.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 80, "meta_description": null, "og_image_media_id": null, "short_description": "Spectacle familial poétique."}', 'Mise à jour du spectacle: Rêves d''Enfance', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(65, 'spectacle', 9, 2, '{"id": 9, "slug": "solitudes-partagees", "genre": "Drame psychologique", "title": "Solitudes Partagées", "awards": ["Prix de la Critique"], "public": true, "status": "archive", "casting": 2, "premiere": "2020-09-25T18:00:00+00:00", "image_url": "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Une réflexion intimiste sur la solitude moderne et les moyens de créer du lien dans notre société.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 110, "meta_description": null, "og_image_media_id": null, "short_description": "Réflexion intimiste sur la solitude."}', 'Mise à jour du spectacle: Solitudes Partagées', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(66, 'spectacle', 10, 2, '{"id": 10, "slug": "memoires-de-guerre", "genre": "Théâtre historique", "title": "Mémoires de Guerre", "awards": ["Grand Prix du Jury - Festival de Nancy"], "public": true, "status": "archive", "casting": 6, "premiere": "2019-11-11T19:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184396/pexels-photo-3184396.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Un témoignage bouleversant sur les survivants de guerre et la transmission de la mémoire.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 120, "meta_description": null, "og_image_media_id": null, "short_description": "Témoignage sur la mémoire de guerre."}', 'Mise à jour du spectacle: Mémoires de Guerre', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(67, 'spectacle', 11, 2, '{"id": 11, "slug": "les-voix-du-silence", "genre": "Théâtre social", "title": "Les Voix du Silence", "awards": ["Prix de l''Innovation Sociale"], "public": true, "status": "archive", "casting": 5, "premiere": "2019-06-15T18:00:00+00:00", "image_url": "https://images.pexels.com/photos/3184327/pexels-photo-3184327.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Spectacle inclusif donnant la parole aux personnes sourdes et malentendantes.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 85, "meta_description": null, "og_image_media_id": null, "short_description": "Spectacle inclusif sur la surdité."}', 'Mise à jour du spectacle: Les Voix du Silence', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(68, 'spectacle', 12, 2, '{"id": 12, "slug": "nuit-blanche-a-paris", "genre": "Comédie", "title": "Nuit Blanche à Paris", "awards": null, "public": true, "status": "archive", "casting": 4, "premiere": "2018-12-20T19:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184354/pexels-photo-3184354.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Une comédie romantique pleine de rebondissements dans les rues de la capitale.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 95, "meta_description": null, "og_image_media_id": null, "short_description": "Comédie romantique parisienne."}', 'Mise à jour du spectacle: Nuit Blanche à Paris', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(69, 'spectacle', 13, 2, '{"id": 13, "slug": "l-appel-de-la-foret", "genre": "Aventure dramatique", "title": "L''Appel de la Forêt", "awards": ["Coup de Cœur du Public"], "public": true, "status": "archive", "casting": 3, "premiere": "2018-03-22T19:00:00+00:00", "image_url": "https://images.pexels.com/photos/3184372/pexels-photo-3184372.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Adaptation théâtrale du chef-d''œuvre de Jack London, entre aventure et introspection.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 105, "meta_description": null, "og_image_media_id": null, "short_description": "Adaptation de Jack London."}', 'Mise à jour du spectacle: L''Appel de la Forêt', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(70, 'spectacle', 14, 2, '{"id": 14, "slug": "portraits-de-famille", "genre": "Drame familial", "title": "Portraits de Famille", "awards": ["Prix de la Meilleure Interprétation Féminine"], "public": true, "status": "archive", "casting": 7, "premiere": "2017-10-05T18:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184387/pexels-photo-3184387.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Une chronique familiale touchante sur trois générations de femmes.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 115, "meta_description": null, "og_image_media_id": null, "short_description": "Chronique familiale sur trois générations."}', 'Mise à jour du spectacle: Portraits de Famille', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(71, 'spectacle', 15, 2, '{"id": 15, "slug": "renaissance", "genre": "Comédie musicale", "title": "Renaissance", "awards": null, "public": true, "status": "archive", "casting": 8, "premiere": "2017-04-18T17:30:00+00:00", "image_url": "https://images.pexels.com/photos/3184445/pexels-photo-3184445.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Un spectacle musical célébrant la renaissance culturelle après les temps difficiles.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 130, "meta_description": null, "og_image_media_id": null, "short_description": "Spectacle musical sur la renaissance."}', 'Mise à jour du spectacle: Renaissance', 'update', '2025-11-21 00:35:40.388051+00', NULL),
	(72, 'spectacle', 16, 2, '{"id": 16, "slug": "les-chemins-de-traverse", "genre": "Drame contemporain", "title": "Les Chemins de Traverse", "awards": ["Révélation de l''Année"], "public": true, "status": "archive", "casting": 4, "premiere": "2016-09-12T18:00:00+00:00", "image_url": "https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1200", "created_at": "2025-11-21T00:35:37.797667+00:00", "created_by": null, "meta_title": null, "updated_at": "2025-11-21T00:35:40.388051+00:00", "description": "Un road-movie théâtral sur la quête d''identité et les rencontres qui changent une vie.", "schema_type": "TheaterEvent", "canonical_url": null, "search_vector": null, "duration_minutes": 100, "meta_description": null, "og_image_media_id": null, "short_description": "Road-movie théâtral."}', 'Mise à jour du spectacle: Les Chemins de Traverse', 'update', '2025-11-21 00:35:40.388051+00', NULL);


--
-- Data for Name: home_about_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."home_about_content" ("id", "slug", "title", "intro1", "intro2", "image_url", "image_media_id", "mission_title", "mission_text", "position", "active", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'default', 'La Passion du Théâtre depuis 2008', 'Née de la rencontre de professionnels passionnés, la compagnie Rouge-Cardinal s''attache à créer des spectacles qui interrogent notre époque tout en célébrant la beauté de l''art théâtral.', 'Notre démarche artistique privilégie l''humain, l''émotion authentique et la recherche constante d''une vérité scénique qui touche et transforme.', 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800', NULL, 'Notre mission', 'Créer des spectacles qui émeuvent, questionnent et rassemblent les publics autour de l''art vivant.', 1, true, '2025-11-21 00:35:37.631576+00', '2025-11-21 00:35:37.631576+00');


--
-- Data for Name: home_hero_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."home_hero_slides" ("id", "slug", "title", "subtitle", "description", "image_url", "image_media_id", "cta_label", "cta_url", "position", "active", "starts_at", "ends_at", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'saison-2025', 'Saison 2025-2026', 'Une programmation exceptionnelle', 'Quatre créations inédites vous attendent cette saison, mêlant tradition et modernité.', 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200', NULL, 'Voir la programmation', '/spectacles', 1, true, NULL, NULL, '2025-11-21 00:35:36.632437+00', '2025-11-21 00:35:36.632437+00'),
	(2, 'creation-phare', 'L’Art de Raconter', 'Des histoires qui résonnent', 'Découvrez notre dernière création, une œuvre captivante qui explore les méandres de l’âme humaine.', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200', NULL, 'Découvrir le spectacle', '/spectacles', 2, true, NULL, NULL, '2025-11-21 00:35:36.632437+00', '2025-11-21 00:35:36.632437+00');


--
-- Data for Name: logs_audit; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."logs_audit" ("id", "user_id", "action", "table_name", "record_id", "old_values", "new_values", "ip_address", "user_agent", "created_at") VALUES
	(1, NULL, 'INSERT', 'communiques_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:36.815222+00'),
	(2, NULL, 'INSERT', 'communiques_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:36.815222+00'),
	(3, NULL, 'INSERT', 'communiques_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:36.815222+00'),
	(4, NULL, 'INSERT', 'partners', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:36.815222+00'),
	(5, NULL, 'INSERT', 'partners', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:36.815222+00'),
	(6, NULL, 'INSERT', 'partners', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:36.815222+00'),
	(7, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:36.815222+00'),
	(8, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:36.815222+00'),
	(9, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:36.815222+00'),
	(10, NULL, 'INSERT', 'evenements', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.135033+00'),
	(11, NULL, 'INSERT', 'evenements', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.135033+00'),
	(12, NULL, 'INSERT', 'evenements', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.135033+00'),
	(13, NULL, 'INSERT', 'evenements', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.135033+00'),
	(14, NULL, 'INSERT', 'communiques_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.135033+00'),
	(15, NULL, 'INSERT', 'communiques_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.135033+00'),
	(16, NULL, 'INSERT', 'communiques_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.135033+00'),
	(17, NULL, 'INSERT', 'communiques_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.135033+00'),
	(18, NULL, 'INSERT', 'articles_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.135033+00'),
	(19, NULL, 'INSERT', 'articles_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.135033+00'),
	(20, NULL, 'INSERT', 'articles_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.135033+00'),
	(21, NULL, 'INSERT', 'membres_equipe', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.270223+00'),
	(22, NULL, 'INSERT', 'membres_equipe', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.270223+00'),
	(23, NULL, 'INSERT', 'membres_equipe', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.270223+00'),
	(24, NULL, 'INSERT', 'membres_equipe', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.270223+00'),
	(25, NULL, 'INSERT', 'membres_equipe', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.270223+00'),
	(26, NULL, 'INSERT', 'home_about_content', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.631576+00'),
	(27, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(28, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(29, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(30, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(31, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(32, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(33, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(34, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(35, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(36, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(37, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(38, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(39, NULL, 'INSERT', 'spectacles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.797667+00'),
	(40, NULL, 'INSERT', 'lieux', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.900472+00'),
	(41, NULL, 'INSERT', 'lieux', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.900472+00'),
	(42, NULL, 'INSERT', 'lieux', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.900472+00'),
	(43, NULL, 'INSERT', 'lieux', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.900472+00'),
	(44, NULL, 'INSERT', 'lieux', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:37.900472+00'),
	(45, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(46, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(47, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(48, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(49, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(50, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(51, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(52, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(53, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(54, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(55, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(56, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(57, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(58, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(59, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(60, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(61, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(62, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(63, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(64, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(65, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(66, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(67, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(68, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(69, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(70, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(71, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(72, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(73, NULL, 'INSERT', 'configurations_site', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.187657+00'),
	(74, NULL, 'INSERT', 'medias', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.372722+00'),
	(75, NULL, 'INSERT', 'medias', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.372722+00'),
	(76, NULL, 'INSERT', 'medias', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.372722+00'),
	(77, NULL, 'INSERT', 'medias', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.372722+00'),
	(78, NULL, 'INSERT', 'medias', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.372722+00'),
	(79, NULL, 'INSERT', 'medias', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.372722+00'),
	(80, NULL, 'INSERT', 'medias', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.372722+00'),
	(81, NULL, 'INSERT', 'medias', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.372722+00'),
	(82, NULL, 'INSERT', 'communiques_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.372722+00'),
	(83, NULL, 'INSERT', 'communiques_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.372722+00'),
	(84, NULL, 'INSERT', 'communiques_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.372722+00'),
	(85, NULL, 'INSERT', 'communiques_presse', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:35:38.372722+00'),
	(86, NULL, 'UPDATE', 'spectacles', '1', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(87, NULL, 'UPDATE', 'spectacles', '2', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(88, NULL, 'UPDATE', 'spectacles', '3', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(89, NULL, 'UPDATE', 'spectacles', '4', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(90, NULL, 'UPDATE', 'spectacles', '5', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(91, NULL, 'UPDATE', 'spectacles', '6', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(92, NULL, 'UPDATE', 'spectacles', '7', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(93, NULL, 'UPDATE', 'spectacles', '8', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(94, NULL, 'UPDATE', 'spectacles', '9', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(95, NULL, 'UPDATE', 'spectacles', '10', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(96, NULL, 'UPDATE', 'spectacles', '11', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(97, NULL, 'UPDATE', 'spectacles', '12', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(98, NULL, 'UPDATE', 'spectacles', '13', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(99, NULL, 'UPDATE', 'spectacles', '14', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(100, NULL, 'UPDATE', 'spectacles', '15', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(101, NULL, 'UPDATE', 'spectacles', '16', NULL, NULL, NULL, NULL, '2025-11-21 00:35:40.388051+00'),
	(102, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:37:47.440829+00'),
	(103, NULL, 'UPDATE', 'profiles', '1', NULL, NULL, NULL, NULL, '2025-11-21 00:37:47.440829+00'),
	(104, NULL, 'DELETE', 'profiles', '1', NULL, NULL, NULL, NULL, '2025-11-21 00:37:47.763218+00'),
	(105, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:40:02.58711+00'),
	(106, NULL, 'UPDATE', 'profiles', '2', NULL, NULL, NULL, NULL, '2025-11-21 00:40:02.58711+00'),
	(107, NULL, 'DELETE', 'profiles', '2', NULL, NULL, NULL, NULL, '2025-11-21 00:40:02.955755+00'),
	(108, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:43:54.788037+00'),
	(109, NULL, 'UPDATE', 'profiles', '3', NULL, NULL, NULL, NULL, '2025-11-21 00:43:54.788037+00'),
	(110, NULL, 'DELETE', 'profiles', '3', NULL, NULL, NULL, NULL, '2025-11-21 00:43:54.947942+00'),
	(111, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:44:13.234187+00'),
	(112, NULL, 'UPDATE', 'profiles', '4', NULL, NULL, NULL, NULL, '2025-11-21 00:44:13.234187+00'),
	(113, NULL, 'DELETE', 'profiles', '4', NULL, NULL, NULL, NULL, '2025-11-21 00:44:13.39578+00'),
	(114, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 00:45:19.105276+00'),
	(115, NULL, 'UPDATE', 'profiles', '5', NULL, NULL, NULL, NULL, '2025-11-21 00:45:19.105276+00'),
	(116, NULL, 'DELETE', 'profiles', '5', NULL, NULL, NULL, NULL, '2025-11-21 00:45:19.442261+00'),
	(117, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 13:42:41.676467+00'),
	(118, NULL, 'UPDATE', 'profiles', '6', NULL, NULL, NULL, NULL, '2025-11-21 13:42:41.676467+00'),
	(119, NULL, 'UPDATE', 'profiles', '6', NULL, NULL, NULL, NULL, '2025-11-21 13:43:40.234663+00'),
	(120, NULL, 'UPDATE', 'profiles', '6', NULL, NULL, NULL, NULL, '2025-11-21 13:48:43.015528+00'),
	(121, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 14:05:51.797839+00'),
	(122, NULL, 'UPDATE', 'profiles', '7', NULL, NULL, NULL, NULL, '2025-11-21 14:05:51.797839+00'),
	(123, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 14:22:31.00416+00'),
	(124, NULL, 'UPDATE', 'profiles', '8', NULL, NULL, NULL, NULL, '2025-11-21 14:22:31.00416+00'),
	(125, NULL, 'DELETE', 'profiles', '8', NULL, NULL, NULL, NULL, '2025-11-21 14:22:31.262619+00'),
	(126, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 14:28:12.252581+00'),
	(127, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 14:29:22.495996+00'),
	(128, NULL, 'DELETE', 'profiles', '9', NULL, NULL, NULL, NULL, '2025-11-21 14:48:23.379422+00'),
	(129, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 14:48:37.361987+00'),
	(130, NULL, 'UPDATE', 'profiles', '11', NULL, NULL, NULL, NULL, '2025-11-21 14:48:37.361987+00'),
	(131, NULL, 'DELETE', 'profiles', '11', NULL, NULL, NULL, NULL, '2025-11-21 14:48:37.59633+00'),
	(132, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 14:49:11.14336+00'),
	(133, NULL, 'UPDATE', 'profiles', '12', NULL, NULL, NULL, NULL, '2025-11-21 14:49:11.14336+00'),
	(134, NULL, 'DELETE', 'profiles', '12', NULL, NULL, NULL, NULL, '2025-11-21 14:49:11.309602+00'),
	(135, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 14:51:09.705876+00'),
	(136, NULL, 'UPDATE', 'profiles', '13', NULL, NULL, NULL, NULL, '2025-11-21 14:51:09.705876+00'),
	(137, NULL, 'DELETE', 'profiles', '13', NULL, NULL, NULL, NULL, '2025-11-21 14:51:09.910073+00'),
	(138, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 14:54:06.67604+00'),
	(139, NULL, 'UPDATE', 'profiles', '14', NULL, NULL, NULL, NULL, '2025-11-21 14:54:06.67604+00'),
	(140, NULL, 'DELETE', 'profiles', '14', NULL, NULL, NULL, NULL, '2025-11-21 14:54:06.832807+00'),
	(141, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 14:59:07.451666+00'),
	(142, NULL, 'UPDATE', 'profiles', '15', NULL, NULL, NULL, NULL, '2025-11-21 14:59:07.451666+00'),
	(143, NULL, 'DELETE', 'profiles', '15', NULL, NULL, NULL, NULL, '2025-11-21 14:59:07.632087+00'),
	(144, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 15:04:09.277592+00'),
	(145, NULL, 'DELETE', 'profiles', '16', NULL, NULL, NULL, NULL, '2025-11-21 15:06:11.415196+00'),
	(146, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 15:06:24.909085+00'),
	(147, NULL, 'DELETE', 'profiles', '17', NULL, NULL, NULL, NULL, '2025-11-21 15:08:41.574873+00'),
	(148, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 15:09:50.772691+00'),
	(149, NULL, 'UPDATE', 'profiles', '18', NULL, NULL, NULL, NULL, '2025-11-21 15:09:50.772691+00'),
	(150, NULL, 'DELETE', 'profiles', '18', NULL, NULL, NULL, NULL, '2025-11-21 15:09:50.93341+00'),
	(151, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 15:10:24.484318+00'),
	(152, NULL, 'UPDATE', 'profiles', '19', NULL, NULL, NULL, NULL, '2025-11-21 15:10:24.484318+00'),
	(153, NULL, 'DELETE', 'profiles', '19', NULL, NULL, NULL, NULL, '2025-11-21 15:10:24.649825+00'),
	(154, NULL, 'INSERT', 'profiles', NULL, NULL, NULL, NULL, NULL, '2025-11-21 15:21:25.599261+00'),
	(155, NULL, 'UPDATE', 'profiles', '20', NULL, NULL, NULL, NULL, '2025-11-21 15:21:25.599261+00'),
	(156, NULL, 'DELETE', 'profiles', '20', NULL, NULL, NULL, NULL, '2025-11-21 15:21:25.773454+00');


--
-- Data for Name: membres_equipe; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."membres_equipe" ("id", "name", "role", "description", "image_url", "photo_media_id", "ordre", "active", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'Léa Robert', 'Scénographe', 'Conçoit des espaces évocateurs pour une immersion poétique du public.', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', NULL, 50, true, '2025-11-21 00:35:37.270223+00', '2025-11-21 00:35:37.270223+00'),
	(2, 'Anne Dupont', 'Directrice artistique', 'Fondatrice de la compagnie, elle dirige la vision artistique et la dramaturgie des créations.', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', NULL, 10, true, '2025-11-21 00:35:37.270223+00', '2025-11-21 00:35:37.270223+00'),
	(3, 'Marc Leroy', 'Metteur en scène', 'Explore des formes scéniques contemporaines, au croisement du texte et du mouvement.', 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg', NULL, 20, true, '2025-11-21 00:35:37.270223+00', '2025-11-21 00:35:37.270223+00'),
	(4, 'Hugo Martin', 'Chargé de production', 'Coordonne la production, les tournées et les partenariats institutionnels.', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', NULL, 40, true, '2025-11-21 00:35:37.270223+00', '2025-11-21 00:35:37.270223+00'),
	(5, 'Sara Benali', 'Comédienne', 'Interprète principale sur plusieurs productions, portée par un jeu sensible et physique.', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', NULL, 30, true, '2025-11-21 00:35:37.270223+00', '2025-11-21 00:35:37.270223+00');


--
-- Data for Name: messages_contact; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."partners" ("id", "name", "description", "website_url", "logo_url", "logo_media_id", "is_active", "display_order", "created_by", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'Théâtre des Champs-Élysées', 'Partenaire scène.', 'https://www.theatrechampselysees.fr', 'https://dummyimage.com/300x150/000/fff&text=Theatre+CE', NULL, true, 30, NULL, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:36.815222+00'),
	(2, 'Ville de Paris', 'Soutien institutionnel à la création et à la diffusion.', 'https://www.paris.fr', 'https://dummyimage.com/300x150/000/fff&text=Ville+de+Paris', NULL, true, 10, NULL, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:36.815222+00'),
	(3, 'Ministère de la Culture', 'Partenaire culturel national.', 'https://www.culture.gouv.fr', 'https://dummyimage.com/300x150/000/fff&text=Ministere', NULL, true, 20, NULL, '2025-11-21 00:35:36.815222+00', '2025-11-21 00:35:36.815222+00');


--
-- Data for Name: pending_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "user_id", "display_name", "slug", "bio", "avatar_media_id", "role", "metadata", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(6, 'ad312cb9-2f06-48a5-a0c0-9a99bfd36228', '', NULL, NULL, NULL, 'admin', '{}', '2025-11-21 13:42:41.676467+00', '2025-11-21 13:48:43.015528+00'),
	(7, '240c0e7f-192f-4a2b-af1c-af049b0adb0f', 'Administrateur', NULL, NULL, NULL, 'admin', '{}', '2025-11-21 14:05:51.797839+00', '2025-11-21 14:05:51.797839+00'),
	(10, '4efa518a-d29f-4ddb-97b5-22940933aa40', '', NULL, NULL, NULL, 'user', '{}', '2025-11-21 14:29:22.495996+00', '2025-11-21 14:29:22.495996+00');


--
-- Data for Name: seo_redirects; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sitemap_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: spectacles_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: spectacles_medias; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: spectacles_membres_equipe; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: spectacles_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: abonnes_newsletter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."abonnes_newsletter_id_seq"', 1, false);


--
-- Name: analytics_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."analytics_events_id_seq"', 1, false);


--
-- Name: articles_presse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."articles_presse_id_seq"', 3, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."categories_id_seq"', 9, true);


--
-- Name: communiques_presse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."communiques_presse_id_seq"', 11, true);


--
-- Name: compagnie_presentation_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."compagnie_presentation_sections_id_seq"', 6, true);


--
-- Name: compagnie_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."compagnie_stats_id_seq"', 4, true);


--
-- Name: compagnie_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."compagnie_values_id_seq"', 4, true);


--
-- Name: contacts_presse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."contacts_presse_id_seq"', 1, false);


--
-- Name: content_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."content_versions_id_seq"', 72, true);


--
-- Name: evenements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."evenements_id_seq"', 4, true);


--
-- Name: home_about_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."home_about_content_id_seq"', 1, true);


--
-- Name: home_hero_slides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."home_hero_slides_id_seq"', 2, true);


--
-- Name: lieux_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."lieux_id_seq"', 5, true);


--
-- Name: logs_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."logs_audit_id_seq"', 156, true);


--
-- Name: medias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."medias_id_seq"', 8, true);


--
-- Name: membres_equipe_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."membres_equipe_id_seq"', 5, true);


--
-- Name: messages_contact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."messages_contact_id_seq"', 1, false);


--
-- Name: partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."partners_id_seq"', 3, true);


--
-- Name: profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."profiles_id_seq"', 20, true);


--
-- Name: seo_redirects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."seo_redirects_id_seq"', 1, false);


--
-- Name: sitemap_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."sitemap_entries_id_seq"', 1, false);


--
-- Name: spectacles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."spectacles_id_seq"', 16, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."tags_id_seq"', 15, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
