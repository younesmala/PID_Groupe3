-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 08 mai 2026 à 20:03
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `reservation`
--

-- --------------------------------------------------------

--
-- Structure de la table `affiliate_profiles`
--

CREATE TABLE `affiliate_profiles` (
  `id` bigint(20) NOT NULL,
  `plan` varchar(20) NOT NULL,
  `api_key` varchar(64) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `artists`
--

CREATE TABLE `artists` (
  `id` bigint(20) NOT NULL,
  `firstname` varchar(60) NOT NULL,
  `lastname` varchar(60) NOT NULL,
  `firstname_en` varchar(60) DEFAULT NULL,
  `firstname_fr` varchar(60) DEFAULT NULL,
  `firstname_nl` varchar(60) DEFAULT NULL,
  `lastname_en` varchar(60) DEFAULT NULL,
  `lastname_fr` varchar(60) DEFAULT NULL,
  `lastname_nl` varchar(60) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `artists`
--

INSERT INTO `artists` (`id`, `firstname`, `lastname`, `firstname_en`, `firstname_fr`, `firstname_nl`, `lastname_en`, `lastname_fr`, `lastname_nl`) VALUES
(1, 'Daniel', 'Marcelin', NULL, 'Daniel', NULL, NULL, 'Marcelin', NULL),
(2, 'Philippe', 'Laurent', NULL, 'Philippe', NULL, NULL, 'Laurent', NULL),
(3, 'Marius', 'Von Mayenburg', NULL, 'Marius', NULL, NULL, 'Von Mayenburg', NULL),
(4, 'Olivier', 'Boudon', NULL, 'Olivier', NULL, NULL, 'Boudon', NULL),
(5, 'Anne Marie', 'Loop', NULL, 'Anne Marie', NULL, NULL, 'Loop', NULL),
(6, 'Pietro', 'Varasso', NULL, 'Pietro', NULL, NULL, 'Varasso', NULL),
(7, 'Laurent', 'Caron', NULL, 'Laurent', NULL, NULL, 'Caron', NULL),
(8, '??lena', 'Perez', NULL, '??lena', NULL, NULL, 'Perez', NULL),
(9, 'Guillaume', 'Alexandre', NULL, 'Guillaume', NULL, NULL, 'Alexandre', NULL),
(10, 'Claude', 'Semal', NULL, 'Claude', NULL, NULL, 'Semal', NULL),
(11, 'Laurence', 'Warin', NULL, 'Laurence', NULL, NULL, 'Warin', NULL),
(12, 'Pierre', 'Wayburn', NULL, 'Pierre', NULL, NULL, 'Wayburn', NULL),
(13, 'Gwendoline', 'Gauthier', NULL, 'Gwendoline', NULL, NULL, 'Gauthier', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `artist_type`
--

CREATE TABLE `artist_type` (
  `id` bigint(20) NOT NULL,
  `artist_id` bigint(20) NOT NULL,
  `type_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `artist_type_show`
--

CREATE TABLE `artist_type_show` (
  `id` bigint(20) NOT NULL,
  `artist_type_id` bigint(20) NOT NULL,
  `show_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `auth_group`
--

INSERT INTO `auth_group` (`id`, `name`) VALUES
(2, 'ADMIN'),
(1, 'MEMBER'),
(3, 'PRODUCER');

-- --------------------------------------------------------

--
-- Structure de la table `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add user', 4, 'add_user'),
(14, 'Can change user', 4, 'change_user'),
(15, 'Can delete user', 4, 'delete_user'),
(16, 'Can view user', 4, 'view_user'),
(17, 'Can add content type', 5, 'add_contenttype'),
(18, 'Can change content type', 5, 'change_contenttype'),
(19, 'Can delete content type', 5, 'delete_contenttype'),
(20, 'Can view content type', 5, 'view_contenttype'),
(21, 'Can add session', 6, 'add_session'),
(22, 'Can change session', 6, 'change_session'),
(23, 'Can delete session', 6, 'delete_session'),
(24, 'Can view session', 6, 'view_session'),
(25, 'Can add artist', 7, 'add_artist'),
(26, 'Can change artist', 7, 'change_artist'),
(27, 'Can delete artist', 7, 'delete_artist'),
(28, 'Can view artist', 7, 'view_artist'),
(29, 'Can add user meta', 8, 'add_usermeta'),
(30, 'Can change user meta', 8, 'change_usermeta'),
(31, 'Can delete user meta', 8, 'delete_usermeta'),
(32, 'Can view user meta', 8, 'view_usermeta'),
(33, 'Can add type', 9, 'add_type'),
(34, 'Can change type', 9, 'change_type'),
(35, 'Can delete type', 9, 'delete_type'),
(36, 'Can view type', 9, 'view_type'),
(37, 'Can add price', 10, 'add_price'),
(38, 'Can change price', 10, 'change_price'),
(39, 'Can delete price', 10, 'delete_price'),
(40, 'Can view price', 10, 'view_price'),
(41, 'Can add locality', 11, 'add_locality'),
(42, 'Can change locality', 11, 'change_locality'),
(43, 'Can delete locality', 11, 'delete_locality'),
(44, 'Can view locality', 11, 'view_locality'),
(45, 'Can add location', 12, 'add_location'),
(46, 'Can change location', 12, 'change_location'),
(47, 'Can delete location', 12, 'delete_location'),
(48, 'Can view location', 12, 'view_location'),
(49, 'Can add reservation', 13, 'add_reservation'),
(50, 'Can change reservation', 13, 'change_reservation'),
(51, 'Can delete reservation', 13, 'delete_reservation'),
(52, 'Can view reservation', 13, 'view_reservation'),
(53, 'Can add show', 14, 'add_show'),
(54, 'Can change show', 14, 'change_show'),
(55, 'Can delete show', 14, 'delete_show'),
(56, 'Can view show', 14, 'view_show'),
(57, 'Can add representation', 15, 'add_representation'),
(58, 'Can change representation', 15, 'change_representation'),
(59, 'Can delete representation', 15, 'delete_representation'),
(60, 'Can view representation', 15, 'view_representation'),
(61, 'Can add review', 16, 'add_review'),
(62, 'Can change review', 16, 'change_review'),
(63, 'Can delete review', 16, 'delete_review'),
(64, 'Can view review', 16, 'view_review'),
(65, 'Can add artist type', 17, 'add_artisttype'),
(66, 'Can change artist type', 17, 'change_artisttype'),
(67, 'Can delete artist type', 17, 'delete_artisttype'),
(68, 'Can view artist type', 17, 'view_artisttype'),
(69, 'Can add artist type show', 18, 'add_artisttypeshow'),
(70, 'Can change artist type show', 18, 'change_artisttypeshow'),
(71, 'Can delete artist type show', 18, 'delete_artisttypeshow'),
(72, 'Can view artist type show', 18, 'view_artisttypeshow'),
(73, 'Can add representation reservation', 19, 'add_representationreservation'),
(74, 'Can change representation reservation', 19, 'change_representationreservation'),
(75, 'Can delete representation reservation', 19, 'delete_representationreservation'),
(76, 'Can view representation reservation', 19, 'view_representationreservation'),
(77, 'Can add comment', 20, 'add_comment'),
(78, 'Can change comment', 20, 'change_comment'),
(79, 'Can delete comment', 20, 'delete_comment'),
(80, 'Can view comment', 20, 'view_comment'),
(81, 'Can add show price', 21, 'add_showprice'),
(82, 'Can change show price', 21, 'change_showprice'),
(83, 'Can delete show price', 21, 'delete_showprice'),
(84, 'Can view show price', 21, 'view_showprice'),
(85, 'Can add affiliate profile', 22, 'add_affiliateprofile'),
(86, 'Can change affiliate profile', 22, 'change_affiliateprofile'),
(87, 'Can delete affiliate profile', 22, 'delete_affiliateprofile'),
(88, 'Can view affiliate profile', 22, 'view_affiliateprofile'),
(89, 'Can add user profile', 23, 'add_userprofile'),
(90, 'Can change user profile', 23, 'change_userprofile'),
(91, 'Can delete user profile', 23, 'delete_userprofile'),
(92, 'Can view user profile', 23, 'view_userprofile');

-- --------------------------------------------------------

--
-- Structure de la table `auth_user`
--

CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `auth_user`
--

INSERT INTO `auth_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`) VALUES
(1, 'pbkdf2_sha256$720000$XKX8seZDKLb94gS3B1oOLs$5NLyjWrr8zHq8HVdzJEWOwzZD6wvwhxGqHCECdiYMMc=', '2025-10-26 18:07:04.000000', 1, 'admin', 'Mohamed', 'Ouedarbi', 'mouedarbi@gmail.com', 1, 1, '2025-10-04 21:52:09.000000'),
(2, 'pbkdf2_sha256$720000$jnRX8LmPHEAsug5r7rOvGa$PQBM0b4w18o8DAWKN4V/W4EFE5yPi06SSNZ3JIG4UiA=', NULL, 0, 'anna', 'Anna', 'Lyse', 'anna.lyse@sull.com', 0, 1, '2025-10-26 19:50:16.000000'),
(3, 'pbkdf2_sha256$720000$z4CkVHazVAym8i9wtaSd02$ivjlVpVgnkDxYYbz0TIw9WLgdgyYgAVqsVrrd7sp5iU=', '2026-05-07 19:33:20.756483', 0, 'testproducteur', 'Producteur', 'Test', 'producteur@test.com', 0, 1, '2026-05-07 00:11:57.845415'),
(4, 'pbkdf2_sha256$720000$kc6WIngXbD0QSOqqCvo4t6$mCWColQeupyjkkdrXDUar3EJmhwmzx6biQZHl+KEaD4=', '2026-05-08 17:42:40.077998', 0, 'testdeux', 'ekfenk', 'ekeke', 'morad@test.com', 0, 1, '2026-05-07 19:10:09.137848'),
(5, 'pbkdf2_sha256$720000$wfns3DQLOR0KUryza8vSU7$4a8uTBZahwY9vzeyE+TWCJqYy3yzEJC2BLVs1sst8ZU=', '2026-05-07 19:22:49.994921', 0, 'user123', 'erjijpe', 'iejri', 'user@test.com', 0, 1, '2026-05-07 19:14:12.422668'),
(6, 'pbkdf2_sha256$720000$S86HQFpBcWrReJxQbqZgco$4QUZXOhp2LYWsfUjoK3ajURytgOgHbJkoRMGf4wAVjE=', '2026-05-08 17:44:52.627632', 0, 'User1', 'USER', 'TEST', 'yns@gmail.com', 0, 1, '2026-05-08 17:44:36.224906');

-- --------------------------------------------------------

--
-- Structure de la table `auth_user_groups`
--

CREATE TABLE `auth_user_groups` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `auth_user_groups`
--

INSERT INTO `auth_user_groups` (`id`, `user_id`, `group_id`) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 1),
(4, 4, 1),
(5, 5, 1),
(6, 6, 1);

-- --------------------------------------------------------

--
-- Structure de la table `auth_user_user_permissions`
--

CREATE TABLE `auth_user_user_permissions` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

CREATE TABLE `comments` (
  `id` bigint(20) NOT NULL,
  `content` longtext NOT NULL,
  `status` varchar(10) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `show_id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) UNSIGNED NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(22, 'api', 'affiliateprofile'),
(23, 'api', 'userprofile'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(4, 'auth', 'user'),
(7, 'catalogue', 'artist'),
(17, 'catalogue', 'artisttype'),
(18, 'catalogue', 'artisttypeshow'),
(20, 'catalogue', 'comment'),
(11, 'catalogue', 'locality'),
(12, 'catalogue', 'location'),
(10, 'catalogue', 'price'),
(15, 'catalogue', 'representation'),
(19, 'catalogue', 'representationreservation'),
(13, 'catalogue', 'reservation'),
(16, 'catalogue', 'review'),
(14, 'catalogue', 'show'),
(21, 'catalogue', 'showprice'),
(9, 'catalogue', 'type'),
(8, 'catalogue', 'usermeta'),
(5, 'contenttypes', 'contenttype'),
(6, 'sessions', 'session');

-- --------------------------------------------------------

--
-- Structure de la table `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-11-30 17:17:50.785109'),
(2, 'auth', '0001_initial', '2025-11-30 17:17:51.112771'),
(3, 'admin', '0001_initial', '2025-11-30 17:17:51.191910'),
(4, 'admin', '0002_logentry_remove_auto_add', '2025-11-30 17:17:51.191910'),
(5, 'admin', '0003_logentry_add_action_flag_choices', '2025-11-30 17:17:51.204845'),
(6, 'contenttypes', '0002_remove_content_type_name', '2025-11-30 17:17:51.246601'),
(7, 'auth', '0002_alter_permission_name_max_length', '2025-11-30 17:17:51.270505'),
(8, 'auth', '0003_alter_user_email_max_length', '2025-11-30 17:17:51.286291'),
(9, 'auth', '0004_alter_user_username_opts', '2025-11-30 17:17:51.302027'),
(10, 'auth', '0005_alter_user_last_login_null', '2025-11-30 17:17:51.347943'),
(11, 'auth', '0006_require_contenttypes_0002', '2025-11-30 17:17:51.350377'),
(12, 'auth', '0007_alter_validators_add_error_messages', '2025-11-30 17:17:51.356152'),
(13, 'auth', '0008_alter_user_username_max_length', '2025-11-30 17:17:51.365622'),
(14, 'auth', '0009_alter_user_last_name_max_length', '2025-11-30 17:17:51.369943'),
(15, 'auth', '0010_alter_group_name_max_length', '2025-11-30 17:17:51.386026'),
(16, 'auth', '0011_update_proxy_permissions', '2025-11-30 17:17:51.392926'),
(17, 'auth', '0012_alter_user_first_name_max_length', '2025-11-30 17:17:51.394953'),
(18, 'catalogue', '0001_initial', '2025-11-30 17:17:51.402136'),
(19, 'sessions', '0001_initial', '2025-11-30 17:17:51.417835'),
(20, 'catalogue', '0002_usermeta', '2026-01-22 14:39:52.905629'),
(21, 'catalogue', '0003_type', '2026-01-22 14:39:52.921663'),
(22, 'catalogue', '0004_price', '2026-01-22 14:39:52.921663'),
(23, 'catalogue', '0005_price_description', '2026-01-22 14:39:52.937529'),
(24, 'catalogue', '0006_locality', '2026-01-22 14:39:52.953455'),
(25, 'catalogue', '0007_rename_postcode_locality_postal_code_location', '2026-01-22 14:39:52.999606'),
(26, 'catalogue', '0008_reservation', '2026-01-22 14:39:53.047121'),
(27, 'catalogue', '0009_show_alter_locality_locality_and_more', '2026-01-22 14:39:53.139536'),
(28, 'catalogue', '0010_alter_show_created_in_location_unique_slug_website', '2026-01-22 14:39:53.234292'),
(29, 'catalogue', '0011_representation', '2026-01-22 14:39:53.312365'),
(30, 'catalogue', '0012_show_unique_slug_created_in', '2026-01-22 14:39:53.322597'),
(31, 'catalogue', '0013_review', '2026-01-22 14:39:53.394556'),
(32, 'catalogue', '0014_artist_types', '2026-01-22 14:39:53.482099'),
(33, 'catalogue', '0015_artist_unique_firstname_lastname', '2026-01-22 14:39:53.483590'),
(34, 'catalogue', '0016_remove_artist_unique_firstname_lastname_and_more', '2026-01-22 14:39:53.499275'),
(35, 'catalogue', '0017_artisttype', '2026-01-22 14:39:53.563552'),
(36, 'catalogue', '0018_artisttypeshow', '2026-01-22 14:39:53.655615'),
(37, 'catalogue', '0019_show_artist_types', '2026-01-22 14:39:53.655615'),
(38, 'catalogue', '0020_artist_unique_firstname_lastname', '2026-01-22 14:39:53.671334'),
(39, 'catalogue', '0021_remove_artist_unique_firstname_lastname', '2026-01-22 14:39:53.671334'),
(40, 'catalogue', '0022_representation_available_seats_and_more', '2026-04-12 11:23:51.307690'),
(41, 'catalogue', '0023_artist_firstname_en_artist_firstname_fr_and_more', '2026-04-12 11:23:51.703716'),
(42, 'catalogue', '0022_reservation_quantity_reservation_representation', '2026-04-15 17:08:11.690118'),
(43, 'catalogue', '0023_representation_available_seats', '2026-04-15 17:15:49.742458'),
(44, 'catalogue', '0024_reservation_payment_status', '2026-04-15 17:16:00.565889'),
(45, 'catalogue', '0025_merge_20260415_1035', '2026-04-15 17:16:00.566925'),
(46, 'catalogue', '0026_show_artist_show_publication_status_and_more', '2026-04-22 16:48:48.403649'),
(47, 'api', '0001_initial', '2026-05-06 18:16:30.822634'),
(48, 'api', '0002_userprofile', '2026-05-06 18:16:30.940607'),
(49, 'catalogue', '0027_alter_show_slug_autoslugfield', '2026-05-06 18:16:30.953868'),
(50, 'catalogue', '0028_populate_show_slugs', '2026-05-06 18:16:30.974702'),
(51, 'catalogue', '0029_review_status_show_producer', '2026-05-06 18:16:31.137175'),
(52, 'catalogue', '0030_comment', '2026-05-06 18:16:31.329410'),
(53, 'catalogue', '0031_add_show_price_model', '2026-05-06 18:16:31.450275'),
(54, 'catalogue', '0032_add_spoken_language_to_show', '2026-05-08 17:37:04.619999');

-- --------------------------------------------------------

--
-- Structure de la table `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('4gwocl84zp2raxulx8wjnzcn1hdgzujt', '.eJxVjLEOwjAMRP8lM4oSB1zMyM43RE7skgJKpaadEP9OK3UA3Xbv3b1N5GUucWk6xUHMxYA5_HaJ81PrBuTB9T7aPNZ5GpLdFLvTZm-j6Ou6u38HhVtZ1yEpKBMR6xlwjRelLmjvQnBZEMiTdwGJHUimrgfMR4_uBMheGMznC9GMNwo:1vQXzw:xyHglgBbIZ_9uJ-m2nfnS2bbU-v5oF-0I_9JnLbjlkI', '2025-12-16 21:33:24.811995'),
('9ys5i29yzfm5rqkifsjylyf0iau3m5wo', 'eyJjYXJ0Ijp7fX0:1wLPCD:aufqNZRrSbYRdX8n1-ziwG976QeYrgvcJSxQbWUrt1c', '2026-05-22 17:41:05.715989'),
('eruwrs4dc1hligbkf8hhxvmqyc1wx1hm', 'eyJjYXJ0Ijp7fX0:1wFTOb:0TdnF9EtqaXmRjJMsSnSNKLVEQD4XBYNiOQEVS1d7Pc', '2026-05-06 08:57:21.960603'),
('ghgjsfn2z07fayok8hopmyrp2jb6uvb1', 'eyJjYXJ0Ijp7fX0:1wLP9B:EcTY8OxEjvIVmtLpQ9NQdR60iipJsY-vR3OIS7OjT-Y', '2026-05-22 17:37:57.269390'),
('i5u781gznu18tcedj4xzv388gy32vv69', 'eyJjYXJ0Ijp7fX0:1wFb2V:4IDyIweF9hfT9_UygdyhiYG_ZAcbFosaHlXqdYsoFrg', '2026-05-06 17:07:03.586363'),
('iqlas514qkdnrul4pwcdugzb5ymzrx2x', 'eyJjYXJ0Ijp7IjNfMSI6eyJyZXByZXNlbnRhdGlvbl9pZCI6MywicHJpY2VfaWQiOjEsInF1YW50aXR5IjoxfX19:1wFT9e:GMD-cFIYYhpncecszIQBd4X41PCpvYv9Z7btwurVK1E', '2026-05-06 08:41:54.114151'),
('jvnqntes3jeyoczk8fou6lvb3cy8nwrs', 'eyJjYXJ0Ijp7fX0:1wFb2V:4IDyIweF9hfT9_UygdyhiYG_ZAcbFosaHlXqdYsoFrg', '2026-05-06 17:07:03.562647'),
('kwj70jrnkutziaaxwy0lccd4v8fwyhnn', 'eyJjYXJ0Ijp7fX0:1wD3t5:CqPP43x5Amtsh9syb6S2ApMuO4Fq13MQxA8WyTZdmFc', '2026-04-29 17:18:51.501377'),
('lybxy304bwus3n8vfuotwk62cfups19k', 'eyJjYXJ0Ijp7fX0:1wLPJm:oVWddOzwnNXzmtTG6z0Z2V_QD5SY9afzq0r45aBE6RM', '2026-05-22 17:48:54.442465'),
('nvhzg8p0ay7aj42fy7k18rjsu48gdlt8', 'eyJjYXJ0Ijp7fX0:1wFTmD:dpBLVUX-ngVIG7Ub27GDUrWMgEE1xp9ftXAp3li9Ctk', '2026-05-06 09:21:45.839856'),
('ogyfzf28hyy0r2ljqcd86d9g0zlu5b6b', 'eyJjYXJ0Ijp7fX0:1wFb3R:1T4lDbS--WHUZUe4ruvDlGyEdmNLHsfQqgShwCeK8mw', '2026-05-06 17:08:01.032093'),
('qcqvvl2bva3595mvr8ef4sqckjg9jmbl', '.eJxVjDEOgzAMRe_iuYrskDTA2J0zIMcOhbYCicCEuHtBYmH9772_gfC8QL3tD2h5Xfp2zWluB4UaCrhtkeWbxhPoh8f3ZGQal3mI5lTMRbNpJk2_1-XeDnrO_VGjC1Z8eDq0hErOMXkuUdlWobOxwMBCFSl1QbEklRKDU--9O2QpLOx_85M53A:1wL9Z4:H16-caBOED5CS_A3zLu-Hv6SfQo1TGzdlW4pcLNPat4', '2026-05-22 00:59:38.929808'),
('xa4k2ncdt9798m67m6kxnhtpnamzgi50', 'eyJjYXJ0Ijp7fX0:1wL2zX:ZNIlcc8WRCzdupp8D9exhDEUVYzw-6eS0U3sNPGr1ds', '2026-05-21 17:58:31.167226');

-- --------------------------------------------------------

--
-- Structure de la table `localities`
--

CREATE TABLE `localities` (
  `id` bigint(20) NOT NULL,
  `locality` varchar(30) NOT NULL,
  `postal_code` varchar(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `localities`
--

INSERT INTO `localities` (`id`, `locality`, `postal_code`) VALUES
(1, 'Bruxelles', '1000'),
(5, 'Schaerbeek', '1030'),
(2, 'Etterbeek', '1040'),
(3, 'Ixelles', '1050'),
(4, 'Saint-Gilles', '1060'),
(7, 'Anderlecht', '1070'),
(6, 'Molenbeek-Saint-Jean', '1080'),
(11, 'Woluwe-Saint-Pierre', '1150'),
(9, 'Watermael-Boitsfort', '1170'),
(8, 'Uccle', '1180'),
(10, 'Woluwe-Saint-Lambert', '1200'),
(18, 'Louvain-la-Neuve', '1348'),
(17, 'Nivelles', '1400'),
(20, 'Anvers', '2000'),
(19, 'Leuven', '3000'),
(13, 'Li??ge', '4000'),
(12, 'Namur', '5000'),
(15, 'Charleroi', '6000'),
(14, 'Mons', '7000'),
(16, 'Tournai', '7500');

-- --------------------------------------------------------

--
-- Structure de la table `locations`
--

CREATE TABLE `locations` (
  `id` bigint(20) NOT NULL,
  `slug` varchar(60) NOT NULL,
  `designation` varchar(60) NOT NULL,
  `address` varchar(255) NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `locality_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `locations`
--

INSERT INTO `locations` (`id`, `slug`, `designation`, `address`, `website`, `phone`, `locality_id`) VALUES
(1, 'art-center', 'Art Center', '', NULL, NULL, 1),
(2, 'atrium', 'Atrium', '', NULL, NULL, 1),
(11, 'opera-house', 'Opera House', '', NULL, NULL, 2),
(12, 'espace-delvaux-la-venerie', '', '', 'https://www.lavenerie.be', NULL, NULL),
(13, 'dexia-art-center', '', '', NULL, NULL, 1),
(14, 'la-samaritaine', '', '', 'http://www.lasamaritaine.be/', NULL, 1),
(15, 'espace-magh', '', '', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Structure de la table `prices`
--

CREATE TABLE `prices` (
  `id` bigint(20) NOT NULL,
  `type` varchar(30) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `description` varchar(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `prices`
--

INSERT INTO `prices` (`id`, `type`, `price`, `start_date`, `end_date`, `description`) VALUES
(1, 'children', 6.00, '2024-01-01', '2024-12-31', 'Tarif enfant (-12 ans), applicable dans les centres culturels.'),
(2, 'student', 8.50, '2024-01-01', '2024-12-31', 'Tarif ??tudiant (carte valide), similaire aux r??ductions th????tres/cin??mas.'),
(3, 'senior', 10.00, '2024-01-01', '2024-12-31', 'Tarif senior (+65), align?? sur les r??ductions en salles bruxelloises.'),
(4, 'article 27', 1.25, '2024-01-01', '2024-12-31', 'Tarif Article 27 pour b??n??ficiaires CPAS.'),
(5, 'adult', 15.00, '2024-01-01', '2024-12-31', 'Tarif standard adulte.'),
(6, 'VIP', 30.00, '2024-01-01', '2024-12-31', 'Tarif VIP incluant placement privil??gi??.');

-- --------------------------------------------------------

--
-- Structure de la table `representations`
--

CREATE TABLE `representations` (
  `id` bigint(20) NOT NULL,
  `schedule` datetime(6) NOT NULL,
  `location_id` bigint(20) DEFAULT NULL,
  `show_id` bigint(20) NOT NULL,
  `available_seats` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `representations`
--

INSERT INTO `representations` (`id`, `schedule`, `location_id`, `show_id`, `available_seats`) VALUES
(1, '2026-06-12 20:00:00.000000', 12, 1, 60),
(2, '2012-10-12 20:30:00.000000', 13, 1, 60),
(3, '2026-06-13 20:30:00.000000', 13, 2, 60),
(4, '2026-06-15 20:00:00.000000', NULL, 3, 60),
(5, '2026-06-14 19:30:00.000000', 14, 4, 60),
(6, '2026-06-18 20:00:00.000000', NULL, 5, 60),
(7, '2026-06-20 20:00:00.000000', NULL, 6, 0),
(8, '2026-06-22 20:30:00.000000', NULL, 7, 60);

-- --------------------------------------------------------

--
-- Structure de la table `representation_reservations`
--

CREATE TABLE `representation_reservations` (
  `id` bigint(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_id` bigint(20) NOT NULL,
  `representation_id` bigint(20) NOT NULL,
  `reservation_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `representation_reservations`
--

INSERT INTO `representation_reservations` (`id`, `quantity`, `price_id`, `representation_id`, `reservation_id`) VALUES
(1, 2, 1, 1, 1),
(2, 1, 2, 2, 2);

-- --------------------------------------------------------

--
-- Structure de la table `reservations`
--

CREATE TABLE `reservations` (
  `id` bigint(20) NOT NULL,
  `booking_date` datetime(6) NOT NULL,
  `status` varchar(60) NOT NULL,
  `user_id` int(11) NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL CHECK (`quantity` >= 0),
  `representation_id` bigint(20) NOT NULL,
  `payment_status` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `reservations`
--

INSERT INTO `reservations` (`id`, `booking_date`, `status`, `user_id`, `quantity`, `representation_id`, `payment_status`) VALUES
(1, '2025-11-21 21:11:36.732000', 'pay?????e', 2, 1, 1, 'pending'),
(2, '2025-11-21 22:15:23.688000', 'pay?????e', 2, 1, 1, 'pending'),
(3, '2025-11-21 22:15:23.700000', 'en attente', 2, 1, 1, 'pending'),
(4, '2026-05-07 19:26:09.444152', 'confirmed', 5, 1, 1, 'paid'),
(5, '2026-05-07 19:28:55.817587', 'confirmed', 5, 1, 2, 'paid'),
(6, '2026-05-07 19:28:55.817587', 'confirmed', 5, 2, 1, 'paid'),
(7, '2026-05-08 17:45:30.904514', 'confirmed', 6, 1, 3, 'paid');

-- --------------------------------------------------------

--
-- Structure de la table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) NOT NULL,
  `review` longtext NOT NULL,
  `stars` smallint(5) UNSIGNED NOT NULL CHECK (`stars` >= 0),
  `validated` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `show_id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `reviews`
--

INSERT INTO `reviews` (`id`, `review`, `stars`, `validated`, `created_at`, `updated_at`, `show_id`, `user_id`, `status`) VALUES
(1, 'Excellent.', 5, 1, '2025-01-07 17:41:03.509000', NULL, 1, 1, 'pending'),
(2, 'Pas mal.', 3, 0, '2025-01-07 17:41:03.509000', NULL, 2, 1, 'pending'),
(3, 'Magnifique!', 5, 1, '2025-01-07 17:41:03.509000', NULL, 1, 2, 'pending');

-- --------------------------------------------------------

--
-- Structure de la table `shows`
--

CREATE TABLE `shows` (
  `id` bigint(20) NOT NULL,
  `slug` varchar(60) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `poster_url` varchar(255) DEFAULT NULL,
  `duration` smallint(5) UNSIGNED DEFAULT NULL CHECK (`duration` >= 0),
  `created_in` smallint(5) UNSIGNED NOT NULL,
  `bookable` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `location_id` bigint(20) DEFAULT NULL,
  `description_en` longtext DEFAULT NULL,
  `description_fr` longtext DEFAULT NULL,
  `description_nl` longtext DEFAULT NULL,
  `title_en` varchar(255) DEFAULT NULL,
  `title_fr` varchar(255) DEFAULT NULL,
  `title_nl` varchar(255) DEFAULT NULL,
  `artist_id` bigint(20) DEFAULT NULL,
  `publication_status` varchar(20) NOT NULL,
  `producer_id` int(11) DEFAULT NULL,
  `spoken_language` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `shows`
--

INSERT INTO `shows` (`id`, `slug`, `title`, `description`, `poster_url`, `duration`, `created_in`, `bookable`, `created_at`, `updated_at`, `location_id`, `description_en`, `description_fr`, `description_nl`, `title_en`, `title_fr`, `title_nl`, `artist_id`, `publication_status`, `producer_id`, `spoken_language`) VALUES
(1, 'ayiti', 'Ayiti', 'Un homme est bloqu?? ?? l\'a??roport.\n Questionn?? par les douaniers, il doit alors justifier son identit??, et surtout prouver qu\'il est ha??tien - Qu\'est-ce qu\'??tre ha??tien ?', 'ayiti.png', 90, 2010, 1, '2025-01-07 17:41:03.509000', NULL, 12, 'A man is stuck at the airport.\n Questioned by customs officers, he must then prove his identity, and above all prove that he is Haitian - What does it mean to be Haitian?', 'Un homme est bloqu?? ?? l\'a??roport.\n Questionn?? par les douaniers, il doit alors justifier son identit??, et surtout prouver qu\'il est ha??tien - Qu\'est-ce qu\'??tre ha??tien ?', 'Een man zit vast op het vliegveld.\n Nadat hij door de douane wordt ondervraagd, moet hij vervolgens zijn identiteit bewijzen, en vooral bewijzen dat hij Ha??tiaan is. Wat betekent het om Ha??tiaan te zijn?', 'Ayiti', 'Ayiti', 'Ayiti', 1, 'approved', NULL, 'fr'),
(2, 'cible-mouvante', 'Cible mouvante', 'Dans ce ?? thriller d\'anticipation ??, des adultes semblent alimenter et v??hiculer une crainte f??roce envers les enfants ??g??s entre 10 et 12 ans.', 'cible-mouvante.png', 90, 2012, 1, '2025-01-07 17:41:15.554000', NULL, 13, 'In this ???anticipatory thriller???, adults seem to fuel and convey a fierce fear towards children aged between 10 and 12 years old.', 'Dans ce ?? thriller d\'anticipation ??, des adultes semblent alimenter et v??hiculer une crainte f??roce envers les enfants ??g??s entre 10 et 12 ans.', 'In deze ???anticiperende thriller??? lijken volwassenen een felle angst aan te wakkeren en over te brengen tegenover kinderen tussen de 10 en 12 jaar oud.', 'Moving target', 'Cible mouvante', 'Bewegend doel', 3, 'approved', NULL, 'fr'),
(3, 'ceci-nest-pas-un-chanteur-belge', 'Ceci n\'est pas un chanteur belge', 'Non peut-??tre ?!\nEntre Magritte (pour le surr??alisme comique) et Maigret (pour le r??alisme m??lancolique), ce dixi??me opus semalien propose quatorze nouvelles chansons m??l??es ?? de petits textes humoristiques et ?? quelques fortes images po??tiques.', 'ceci-nest-pas-un-chanteur-belge.png', 90, 2014, 0, '2025-01-07 17:41:15.585000', NULL, NULL, 'No maybe?!\nBetween Magritte (for comic surrealism) and Maigret (for melancholic realism), this tenth Semali opus offers fourteen new songs mixed with small humorous texts and some strong poetic images.', 'Non peut-??tre ?!\nEntre Magritte (pour le surr??alisme comique) et Maigret (pour le r??alisme m??lancolique), ce dixi??me opus semalien propose quatorze nouvelles chansons m??l??es ?? de petits textes humoristiques et ?? quelques fortes images po??tiques.', 'Nee misschien?!\nTussen Magritte (voor komisch surrealisme) en Maigret (voor melancholisch realisme) biedt dit tiende Semali-opus veertien nieuwe liedjes gemixt met kleine humoristische teksten en enkele sterke po??tische beelden.', 'This is not a Belgian singer', 'Ceci n\'est pas un chanteur belge', 'Dit is geen Belgische zanger', 10, 'approved', NULL, 'fr'),
(4, 'manneke', 'Manneke??? !', 'A tour de r??le, Pierre se joue de ses oncles, tantes, grands-parents et surtout de sa m??re.', 'manneke.png', 90, 2011, 1, '2025-01-07 17:41:40.894000', NULL, 14, 'In turn, Pierre plays with his uncles, aunts, grandparents and especially his mother.', 'A tour de r??le, Pierre se joue de ses oncles, tantes, grands-parents et surtout de sa m??re.', 'Op zijn beurt speelt Pierre met zijn ooms, tantes, grootouders en vooral zijn moeder.', 'Manneke???!', 'Manneke??? !', 'Manneke???!', 12, 'approved', NULL, 'fr'),
(5, 'du-haut-de-mon-perchoir', 'Du haut de mon perchoir', 'Un regard tendre et lucide sur le monde, porte par une parole intime, drole et poetique.', 'du-haut-de-mon-perchoir.png', 75, 2026, 1, '2026-04-22 18:45:00.000000', NULL, NULL, 'A tender and lucid look at the world, carried by intimate, funny and poetic words.', 'Un regard tendre et lucide sur le monde, porte par une parole intime, drole et poetique.', 'Een tedere en heldere blik op de wereld, gedragen door intieme, grappige en po??tische woorden.', 'From the top of my perch', 'Du haut de mon perchoir', 'Vanaf de top van mijn zitstok', 13, 'approved', NULL, 'fr'),
(6, 'le-spectacle-de-la-vie', 'Le spectacle de la vie', 'Une traversee sensible des petits instants qui nous transforment, entre humour, emotion et energie de scene.', 'le-spectacle-de-la-vie.png', 90, 2026, 1, '2026-04-22 18:46:00.000000', NULL, NULL, 'A sensitive journey through the little moments that transform us, between humor, emotion and stage energy.', 'Une traversee sensible des petits instants qui nous transforment, entre humour, emotion et energie de scene.', 'Een gevoelige reis door de kleine momenten die ons transformeren, tussen humor, emotie en podiumenergie.', 'The spectacle of life', 'Le spectacle de la vie', 'Het spektakel van het leven', 5, 'approved', NULL, 'fr'),
(7, 'a-voir-et-a-revoir', 'A voir et a revoir', 'Un spectacle lumineux et rythm??, pense comme une parenthese joyeuse a revivre encore et encore.', 'a-voir-et-a-revoir.png', 80, 2026, 1, '2026-04-22 18:47:00.000000', NULL, NULL, 'A luminous and rhythmic show, thought of as a joyful interlude to relive again and again.', 'Un spectacle lumineux et rythm??, pense comme une parenthese joyeuse a revivre encore et encore.', 'Een lichtgevende en ritmische show, gezien als een vreugdevol intermezzo om steeds opnieuw te beleven.', 'To see and to see again', 'A voir et a revoir', 'Om te zien en opnieuw te zien', 7, 'approved', NULL, 'fr'),
(8, 'spectacle-test', 'Spectacle Test', 'Spectacle Test', NULL, 90, 1, 0, '2026-05-07 00:23:24.985263', NULL, NULL, 'Test Show', 'Spectacle Test', 'Testshow', 'Test Show', 'Spectacle Test', 'Testshow', NULL, 'pending', 3, 'fr');

-- --------------------------------------------------------

--
-- Structure de la table `show_prices`
--

CREATE TABLE `show_prices` (
  `id` bigint(20) NOT NULL,
  `category` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `show_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `types`
--

CREATE TABLE `types` (
  `id` bigint(20) NOT NULL,
  `type` varchar(60) NOT NULL,
  `type_en` varchar(60) DEFAULT NULL,
  `type_fr` varchar(60) DEFAULT NULL,
  `type_nl` varchar(60) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `types`
--

INSERT INTO `types` (`id`, `type`, `type_en`, `type_fr`, `type_nl`) VALUES
(1, 'auteur', NULL, 'auteur', NULL),
(2, 'sc??nographe', NULL, 'sc??nographe', NULL),
(3, 'com??dien', NULL, 'com??dien', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `user_meta`
--

CREATE TABLE `user_meta` (
  `id` bigint(20) NOT NULL,
  `langue` varchar(2) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `user_meta`
--

INSERT INTO `user_meta` (`id`, `langue`, `user_id`) VALUES
(1, 'en', 2),
(2, 'fr', 1);

-- --------------------------------------------------------

--
-- Structure de la table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` bigint(20) NOT NULL,
  `role` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `role`, `user_id`) VALUES
(1, 'PRODUCER', 3),
(2, 'PRODUCER', 4),
(3, 'USER', 5),
(4, 'USER', 6);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `affiliate_profiles`
--
ALTER TABLE `affiliate_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_key` (`api_key`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Index pour la table `artists`
--
ALTER TABLE `artists`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `artist_type`
--
ALTER TABLE `artist_type`
  ADD PRIMARY KEY (`id`),
  ADD KEY `artist_type_artist_id_149b3981_fk_artists_id` (`artist_id`),
  ADD KEY `artist_type_type_id_ddfedbec_fk_types_id` (`type_id`);

--
-- Index pour la table `artist_type_show`
--
ALTER TABLE `artist_type_show`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `artist_type_show_show_id_artist_type_id_b2b04eb2_uniq` (`show_id`,`artist_type_id`),
  ADD KEY `artist_type_show_artist_type_id_a12f3364_fk_artist_type_id` (`artist_type_id`);

--
-- Index pour la table `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Index pour la table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Index pour la table `auth_user`
--
ALTER TABLE `auth_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Index pour la table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  ADD KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`);

--
-- Index pour la table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  ADD KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`);

--
-- Index pour la table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comments_show_id_16d2d86d_fk_shows_id` (`show_id`),
  ADD KEY `comments_user_id_b8fd0b64_fk_auth_user_id` (`user_id`);

--
-- Index pour la table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`);

--
-- Index pour la table `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Index pour la table `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Index pour la table `localities`
--
ALTER TABLE `localities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_postal_code_locality` (`postal_code`,`locality`);

--
-- Index pour la table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `unique_slug_website` (`slug`,`website`),
  ADD KEY `locations_locality_id_22dd0b44_fk_localities_id` (`locality_id`);

--
-- Index pour la table `prices`
--
ALTER TABLE `prices`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `representations`
--
ALTER TABLE `representations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `representations_location_id_860c4ba1_fk_locations_id` (`location_id`),
  ADD KEY `representations_show_id_90b07717_fk_shows_id` (`show_id`);

--
-- Index pour la table `representation_reservations`
--
ALTER TABLE `representation_reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `representation_reservations_price_id_de97d281_fk_prices_id` (`price_id`),
  ADD KEY `representation_reser_representation_id_92943868_fk_represent` (`representation_id`),
  ADD KEY `representation_reser_reservation_id_32cd428d_fk_reservati` (`reservation_id`);

--
-- Index pour la table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservations_user_id_d03abc5b_fk_auth_user_id` (`user_id`),
  ADD KEY `reservations_representation_id_5f66501d_fk_representations_id` (`representation_id`);

--
-- Index pour la table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviews_show_id_53c4ca85_fk_shows_id` (`show_id`),
  ADD KEY `reviews_user_id_c23b0903_fk_auth_user_id` (`user_id`);

--
-- Index pour la table `shows`
--
ALTER TABLE `shows`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `unique_slug_created_in` (`slug`,`created_in`),
  ADD KEY `shows_location_id_a6832141_fk_locations_id` (`location_id`),
  ADD KEY `shows_artist_id_3eeaba27_fk_artists_id` (`artist_id`),
  ADD KEY `shows_producer_id_4e7fbb97_fk_auth_user_id` (`producer_id`);

--
-- Index pour la table `show_prices`
--
ALTER TABLE `show_prices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `show_prices_show_id_fb472ea4_fk_shows_id` (`show_id`);

--
-- Index pour la table `types`
--
ALTER TABLE `types`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `user_meta`
--
ALTER TABLE `user_meta`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Index pour la table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `affiliate_profiles`
--
ALTER TABLE `affiliate_profiles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `artists`
--
ALTER TABLE `artists`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `artist_type`
--
ALTER TABLE `artist_type`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `artist_type_show`
--
ALTER TABLE `artist_type_show`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT pour la table `auth_user`
--
ALTER TABLE `auth_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pour la table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT pour la table `localities`
--
ALTER TABLE `localities`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `prices`
--
ALTER TABLE `prices`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `representations`
--
ALTER TABLE `representations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `representation_reservations`
--
ALTER TABLE `representation_reservations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `shows`
--
ALTER TABLE `shows`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `show_prices`
--
ALTER TABLE `show_prices`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `types`
--
ALTER TABLE `types`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `user_meta`
--
ALTER TABLE `user_meta`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `affiliate_profiles`
--
ALTER TABLE `affiliate_profiles`
  ADD CONSTRAINT `affiliate_profiles_user_id_f25e8b2e_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Contraintes pour la table `artist_type`
--
ALTER TABLE `artist_type`
  ADD CONSTRAINT `artist_type_artist_id_149b3981_fk_artists_id` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`),
  ADD CONSTRAINT `artist_type_type_id_ddfedbec_fk_types_id` FOREIGN KEY (`type_id`) REFERENCES `types` (`id`);

--
-- Contraintes pour la table `artist_type_show`
--
ALTER TABLE `artist_type_show`
  ADD CONSTRAINT `artist_type_show_artist_type_id_a12f3364_fk_artist_type_id` FOREIGN KEY (`artist_type_id`) REFERENCES `artist_type` (`id`),
  ADD CONSTRAINT `artist_type_show_show_id_656adc7c_fk_shows_id` FOREIGN KEY (`show_id`) REFERENCES `shows` (`id`);

--
-- Contraintes pour la table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Contraintes pour la table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Contraintes pour la table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Contraintes pour la table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Contraintes pour la table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_show_id_16d2d86d_fk_shows_id` FOREIGN KEY (`show_id`) REFERENCES `shows` (`id`),
  ADD CONSTRAINT `comments_user_id_b8fd0b64_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Contraintes pour la table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Contraintes pour la table `locations`
--
ALTER TABLE `locations`
  ADD CONSTRAINT `locations_locality_id_22dd0b44_fk_localities_id` FOREIGN KEY (`locality_id`) REFERENCES `localities` (`id`);

--
-- Contraintes pour la table `representations`
--
ALTER TABLE `representations`
  ADD CONSTRAINT `representations_location_id_860c4ba1_fk_locations_id` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `representations_show_id_90b07717_fk_shows_id` FOREIGN KEY (`show_id`) REFERENCES `shows` (`id`);

--
-- Contraintes pour la table `representation_reservations`
--
ALTER TABLE `representation_reservations`
  ADD CONSTRAINT `representation_reser_representation_id_92943868_fk_represent` FOREIGN KEY (`representation_id`) REFERENCES `representations` (`id`),
  ADD CONSTRAINT `representation_reser_reservation_id_32cd428d_fk_reservati` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`),
  ADD CONSTRAINT `representation_reservations_price_id_de97d281_fk_prices_id` FOREIGN KEY (`price_id`) REFERENCES `prices` (`id`);

--
-- Contraintes pour la table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_representation_id_5f66501d_fk_representations_id` FOREIGN KEY (`representation_id`) REFERENCES `representations` (`id`),
  ADD CONSTRAINT `reservations_user_id_d03abc5b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Contraintes pour la table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_show_id_53c4ca85_fk_shows_id` FOREIGN KEY (`show_id`) REFERENCES `shows` (`id`),
  ADD CONSTRAINT `reviews_user_id_c23b0903_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Contraintes pour la table `shows`
--
ALTER TABLE `shows`
  ADD CONSTRAINT `shows_artist_id_3eeaba27_fk_artists_id` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`),
  ADD CONSTRAINT `shows_location_id_a6832141_fk_locations_id` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `shows_producer_id_4e7fbb97_fk_auth_user_id` FOREIGN KEY (`producer_id`) REFERENCES `auth_user` (`id`);

--
-- Contraintes pour la table `show_prices`
--
ALTER TABLE `show_prices`
  ADD CONSTRAINT `show_prices_show_id_fb472ea4_fk_shows_id` FOREIGN KEY (`show_id`) REFERENCES `shows` (`id`);

--
-- Contraintes pour la table `user_meta`
--
ALTER TABLE `user_meta`
  ADD CONSTRAINT `user_meta_user_id_58c29229_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Contraintes pour la table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_user_id_8c5ab5fe_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
