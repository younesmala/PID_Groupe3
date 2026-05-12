-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: reservation
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `artist_type`
--

DROP TABLE IF EXISTS `artist_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `artist_type` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `artist_id` bigint(20) NOT NULL,
  `type_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `artist_type_artist_id_149b3981_fk_artists_id` (`artist_id`),
  KEY `artist_type_type_id_ddfedbec_fk_types_id` (`type_id`),
  CONSTRAINT `artist_type_artist_id_149b3981_fk_artists_id` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`),
  CONSTRAINT `artist_type_type_id_ddfedbec_fk_types_id` FOREIGN KEY (`type_id`) REFERENCES `types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artist_type`
--

LOCK TABLES `artist_type` WRITE;
/*!40000 ALTER TABLE `artist_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `artist_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `artist_type_show`
--

DROP TABLE IF EXISTS `artist_type_show`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `artist_type_show` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `artist_type_id` bigint(20) NOT NULL,
  `show_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `artist_type_show_show_id_artist_type_id_b2b04eb2_uniq` (`show_id`,`artist_type_id`),
  KEY `artist_type_show_artist_type_id_a12f3364_fk_artist_type_id` (`artist_type_id`),
  CONSTRAINT `artist_type_show_artist_type_id_a12f3364_fk_artist_type_id` FOREIGN KEY (`artist_type_id`) REFERENCES `artist_type` (`id`),
  CONSTRAINT `artist_type_show_show_id_656adc7c_fk_shows_id` FOREIGN KEY (`show_id`) REFERENCES `shows` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artist_type_show`
--

LOCK TABLES `artist_type_show` WRITE;
/*!40000 ALTER TABLE `artist_type_show` DISABLE KEYS */;
/*!40000 ALTER TABLE `artist_type_show` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `artists`
--

DROP TABLE IF EXISTS `artists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `artists` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(60) NOT NULL,
  `lastname` varchar(60) NOT NULL,
  `firstname_en` varchar(60) DEFAULT NULL,
  `firstname_fr` varchar(60) DEFAULT NULL,
  `firstname_nl` varchar(60) DEFAULT NULL,
  `lastname_en` varchar(60) DEFAULT NULL,
  `lastname_fr` varchar(60) DEFAULT NULL,
  `lastname_nl` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artists`
--

LOCK TABLES `artists` WRITE;
/*!40000 ALTER TABLE `artists` DISABLE KEYS */;
INSERT INTO `artists` VALUES (1,'Daniel','Marcelin',NULL,'Daniel',NULL,NULL,'Marcelin',NULL),(2,'Philippe','Laurent',NULL,'Philippe',NULL,NULL,'Laurent',NULL),(3,'Marius','Von Mayenburg',NULL,'Marius',NULL,NULL,'Von Mayenburg',NULL),(4,'Olivier','Boudon',NULL,'Olivier',NULL,NULL,'Boudon',NULL),(5,'Anne Marie','Loop',NULL,'Anne Marie',NULL,NULL,'Loop',NULL),(6,'Pietro','Varasso',NULL,'Pietro',NULL,NULL,'Varasso',NULL),(7,'Laurent','Caron',NULL,'Laurent',NULL,NULL,'Caron',NULL),(8,'Élena','Perez',NULL,'Élena',NULL,NULL,'Perez',NULL),(9,'Guillaume','Alexandre',NULL,'Guillaume',NULL,NULL,'Alexandre',NULL),(10,'Claude','Semal',NULL,'Claude',NULL,NULL,'Semal',NULL),(11,'Laurence','Warin',NULL,'Laurence',NULL,NULL,'Warin',NULL),(12,'Pierre','Wayburn',NULL,'Pierre',NULL,NULL,'Wayburn',NULL),(13,'Gwendoline','Gauthier',NULL,'Gwendoline',NULL,NULL,'Gauthier',NULL);
/*!40000 ALTER TABLE `artists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
INSERT INTO `auth_group` VALUES (2,'ADMIN'),(1,'MEMBER'),(3,'PRODUCER');
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add artist',7,'add_artist'),(26,'Can change artist',7,'change_artist'),(27,'Can delete artist',7,'delete_artist'),(28,'Can view artist',7,'view_artist'),(29,'Can add user meta',8,'add_usermeta'),(30,'Can change user meta',8,'change_usermeta'),(31,'Can delete user meta',8,'delete_usermeta'),(32,'Can view user meta',8,'view_usermeta'),(33,'Can add type',9,'add_type'),(34,'Can change type',9,'change_type'),(35,'Can delete type',9,'delete_type'),(36,'Can view type',9,'view_type'),(37,'Can add price',10,'add_price'),(38,'Can change price',10,'change_price'),(39,'Can delete price',10,'delete_price'),(40,'Can view price',10,'view_price'),(41,'Can add locality',11,'add_locality'),(42,'Can change locality',11,'change_locality'),(43,'Can delete locality',11,'delete_locality'),(44,'Can view locality',11,'view_locality'),(45,'Can add location',12,'add_location'),(46,'Can change location',12,'change_location'),(47,'Can delete location',12,'delete_location'),(48,'Can view location',12,'view_location'),(49,'Can add reservation',13,'add_reservation'),(50,'Can change reservation',13,'change_reservation'),(51,'Can delete reservation',13,'delete_reservation'),(52,'Can view reservation',13,'view_reservation'),(53,'Can add show',14,'add_show'),(54,'Can change show',14,'change_show'),(55,'Can delete show',14,'delete_show'),(56,'Can view show',14,'view_show'),(57,'Can add representation',15,'add_representation'),(58,'Can change representation',15,'change_representation'),(59,'Can delete representation',15,'delete_representation'),(60,'Can view representation',15,'view_representation'),(61,'Can add review',16,'add_review'),(62,'Can change review',16,'change_review'),(63,'Can delete review',16,'delete_review'),(64,'Can view review',16,'view_review'),(65,'Can add artist type',17,'add_artisttype'),(66,'Can change artist type',17,'change_artisttype'),(67,'Can delete artist type',17,'delete_artisttype'),(68,'Can view artist type',17,'view_artisttype'),(69,'Can add artist type show',18,'add_artisttypeshow'),(70,'Can change artist type show',18,'change_artisttypeshow'),(71,'Can delete artist type show',18,'delete_artisttypeshow'),(72,'Can view artist type show',18,'view_artisttypeshow'),(73,'Can add representation reservation',19,'add_representationreservation'),(74,'Can change representation reservation',19,'change_representationreservation'),(75,'Can delete representation reservation',19,'delete_representationreservation'),(76,'Can view representation reservation',19,'view_representationreservation');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'pbkdf2_sha256$720000$XKX8seZDKLb94gS3B1oOLs$5NLyjWrr8zHq8HVdzJEWOwzZD6wvwhxGqHCECdiYMMc=','2025-10-26 18:07:04.000000',1,'admin','Mohamed','Ouedarbi','mouedarbi@gmail.com',1,1,'2025-10-04 21:52:09.000000'),(2,'pbkdf2_sha256$720000$jnRX8LmPHEAsug5r7rOvGa$PQBM0b4w18o8DAWKN4V/W4EFE5yPi06SSNZ3JIG4UiA=',NULL,0,'anna','Anna','Lyse','anna.lyse@sull.com',0,1,'2025-10-26 19:50:16.000000');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
INSERT INTO `auth_user_groups` VALUES (1,1,1),(2,2,2);
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(7,'catalogue','artist'),(17,'catalogue','artisttype'),(18,'catalogue','artisttypeshow'),(11,'catalogue','locality'),(12,'catalogue','location'),(10,'catalogue','price'),(15,'catalogue','representation'),(19,'catalogue','representationreservation'),(13,'catalogue','reservation'),(16,'catalogue','review'),(14,'catalogue','show'),(9,'catalogue','type'),(8,'catalogue','usermeta'),(5,'contenttypes','contenttype'),(6,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-11-30 17:17:50.785109'),(2,'auth','0001_initial','2025-11-30 17:17:51.112771'),(3,'admin','0001_initial','2025-11-30 17:17:51.191910'),(4,'admin','0002_logentry_remove_auto_add','2025-11-30 17:17:51.191910'),(5,'admin','0003_logentry_add_action_flag_choices','2025-11-30 17:17:51.204845'),(6,'contenttypes','0002_remove_content_type_name','2025-11-30 17:17:51.246601'),(7,'auth','0002_alter_permission_name_max_length','2025-11-30 17:17:51.270505'),(8,'auth','0003_alter_user_email_max_length','2025-11-30 17:17:51.286291'),(9,'auth','0004_alter_user_username_opts','2025-11-30 17:17:51.302027'),(10,'auth','0005_alter_user_last_login_null','2025-11-30 17:17:51.347943'),(11,'auth','0006_require_contenttypes_0002','2025-11-30 17:17:51.350377'),(12,'auth','0007_alter_validators_add_error_messages','2025-11-30 17:17:51.356152'),(13,'auth','0008_alter_user_username_max_length','2025-11-30 17:17:51.365622'),(14,'auth','0009_alter_user_last_name_max_length','2025-11-30 17:17:51.369943'),(15,'auth','0010_alter_group_name_max_length','2025-11-30 17:17:51.386026'),(16,'auth','0011_update_proxy_permissions','2025-11-30 17:17:51.392926'),(17,'auth','0012_alter_user_first_name_max_length','2025-11-30 17:17:51.394953'),(18,'catalogue','0001_initial','2025-11-30 17:17:51.402136'),(19,'sessions','0001_initial','2025-11-30 17:17:51.417835'),(20,'catalogue','0002_usermeta','2026-01-22 14:39:52.905629'),(21,'catalogue','0003_type','2026-01-22 14:39:52.921663'),(22,'catalogue','0004_price','2026-01-22 14:39:52.921663'),(23,'catalogue','0005_price_description','2026-01-22 14:39:52.937529'),(24,'catalogue','0006_locality','2026-01-22 14:39:52.953455'),(25,'catalogue','0007_rename_postcode_locality_postal_code_location','2026-01-22 14:39:52.999606'),(26,'catalogue','0008_reservation','2026-01-22 14:39:53.047121'),(27,'catalogue','0009_show_alter_locality_locality_and_more','2026-01-22 14:39:53.139536'),(28,'catalogue','0010_alter_show_created_in_location_unique_slug_website','2026-01-22 14:39:53.234292'),(29,'catalogue','0011_representation','2026-01-22 14:39:53.312365'),(30,'catalogue','0012_show_unique_slug_created_in','2026-01-22 14:39:53.322597'),(31,'catalogue','0013_review','2026-01-22 14:39:53.394556'),(32,'catalogue','0014_artist_types','2026-01-22 14:39:53.482099'),(33,'catalogue','0015_artist_unique_firstname_lastname','2026-01-22 14:39:53.483590'),(34,'catalogue','0016_remove_artist_unique_firstname_lastname_and_more','2026-01-22 14:39:53.499275'),(35,'catalogue','0017_artisttype','2026-01-22 14:39:53.563552'),(36,'catalogue','0018_artisttypeshow','2026-01-22 14:39:53.655615'),(37,'catalogue','0019_show_artist_types','2026-01-22 14:39:53.655615'),(38,'catalogue','0020_artist_unique_firstname_lastname','2026-01-22 14:39:53.671334'),(39,'catalogue','0021_remove_artist_unique_firstname_lastname','2026-01-22 14:39:53.671334'),(40,'catalogue','0022_representation_available_seats_and_more','2026-04-12 11:23:51.307690'),(41,'catalogue','0023_artist_firstname_en_artist_firstname_fr_and_more','2026-04-12 11:23:51.703716'),(42,'catalogue','0022_reservation_quantity_reservation_representation','2026-04-15 17:08:11.690118'),(43,'catalogue','0023_representation_available_seats','2026-04-15 17:15:49.742458'),(44,'catalogue','0024_reservation_payment_status','2026-04-15 17:16:00.565889'),(45,'catalogue','0025_merge_20260415_1035','2026-04-15 17:16:00.566925'),(46,'catalogue','0026_show_artist_show_publication_status_and_more','2026-04-22 16:48:48.403649');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('4gwocl84zp2raxulx8wjnzcn1hdgzujt','.eJxVjLEOwjAMRP8lM4oSB1zMyM43RE7skgJKpaadEP9OK3UA3Xbv3b1N5GUucWk6xUHMxYA5_HaJ81PrBuTB9T7aPNZ5GpLdFLvTZm-j6Ou6u38HhVtZ1yEpKBMR6xlwjRelLmjvQnBZEMiTdwGJHUimrgfMR4_uBMheGMznC9GMNwo:1vQXzw:xyHglgBbIZ_9uJ-m2nfnS2bbU-v5oF-0I_9JnLbjlkI','2025-12-16 21:33:24.811995'),('eruwrs4dc1hligbkf8hhxvmqyc1wx1hm','eyJjYXJ0Ijp7fX0:1wFTOb:0TdnF9EtqaXmRjJMsSnSNKLVEQD4XBYNiOQEVS1d7Pc','2026-05-06 08:57:21.960603'),('i5u781gznu18tcedj4xzv388gy32vv69','eyJjYXJ0Ijp7fX0:1wFb2V:4IDyIweF9hfT9_UygdyhiYG_ZAcbFosaHlXqdYsoFrg','2026-05-06 17:07:03.586363'),('iqlas514qkdnrul4pwcdugzb5ymzrx2x','eyJjYXJ0Ijp7IjNfMSI6eyJyZXByZXNlbnRhdGlvbl9pZCI6MywicHJpY2VfaWQiOjEsInF1YW50aXR5IjoxfX19:1wFT9e:GMD-cFIYYhpncecszIQBd4X41PCpvYv9Z7btwurVK1E','2026-05-06 08:41:54.114151'),('jvnqntes3jeyoczk8fou6lvb3cy8nwrs','eyJjYXJ0Ijp7fX0:1wFb2V:4IDyIweF9hfT9_UygdyhiYG_ZAcbFosaHlXqdYsoFrg','2026-05-06 17:07:03.562647'),('kwj70jrnkutziaaxwy0lccd4v8fwyhnn','eyJjYXJ0Ijp7fX0:1wD3t5:CqPP43x5Amtsh9syb6S2ApMuO4Fq13MQxA8WyTZdmFc','2026-04-29 17:18:51.501377'),('nvhzg8p0ay7aj42fy7k18rjsu48gdlt8','eyJjYXJ0Ijp7fX0:1wFTmD:dpBLVUX-ngVIG7Ub27GDUrWMgEE1xp9ftXAp3li9Ctk','2026-05-06 09:21:45.839856'),('ogyfzf28hyy0r2ljqcd86d9g0zlu5b6b','eyJjYXJ0Ijp7fX0:1wFb3R:1T4lDbS--WHUZUe4ruvDlGyEdmNLHsfQqgShwCeK8mw','2026-05-06 17:08:01.032093');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `localities`
--

DROP TABLE IF EXISTS `localities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `localities` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `locality` varchar(30) NOT NULL,
  `postal_code` varchar(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_postal_code_locality` (`postal_code`,`locality`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `localities`
--

LOCK TABLES `localities` WRITE;
/*!40000 ALTER TABLE `localities` DISABLE KEYS */;
INSERT INTO `localities` VALUES (1,'Bruxelles','1000'),(5,'Schaerbeek','1030'),(2,'Etterbeek','1040'),(3,'Ixelles','1050'),(4,'Saint-Gilles','1060'),(7,'Anderlecht','1070'),(6,'Molenbeek-Saint-Jean','1080'),(11,'Woluwe-Saint-Pierre','1150'),(9,'Watermael-Boitsfort','1170'),(8,'Uccle','1180'),(10,'Woluwe-Saint-Lambert','1200'),(18,'Louvain-la-Neuve','1348'),(17,'Nivelles','1400'),(20,'Anvers','2000'),(19,'Leuven','3000'),(13,'Liège','4000'),(12,'Namur','5000'),(15,'Charleroi','6000'),(14,'Mons','7000'),(16,'Tournai','7500');
/*!40000 ALTER TABLE `localities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `locations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `slug` varchar(60) NOT NULL,
  `designation` varchar(60) NOT NULL,
  `address` varchar(255) NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `locality_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `unique_slug_website` (`slug`,`website`),
  KEY `locations_locality_id_22dd0b44_fk_localities_id` (`locality_id`),
  CONSTRAINT `locations_locality_id_22dd0b44_fk_localities_id` FOREIGN KEY (`locality_id`) REFERENCES `localities` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'art-center','Art Center','',NULL,NULL,1),(2,'atrium','Atrium','',NULL,NULL,1),(11,'opera-house','Opera House','',NULL,NULL,2),(12,'espace-delvaux-la-venerie','','','https://www.lavenerie.be',NULL,NULL),(13,'dexia-art-center','','',NULL,NULL,1),(14,'la-samaritaine','','','http://www.lasamaritaine.be/',NULL,1),(15,'espace-magh','','',NULL,NULL,1);
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prices`
--

DROP TABLE IF EXISTS `prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prices` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` varchar(30) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `description` varchar(120) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prices`
--

LOCK TABLES `prices` WRITE;
/*!40000 ALTER TABLE `prices` DISABLE KEYS */;
INSERT INTO `prices` VALUES (1,'children',6.00,'2024-01-01','2024-12-31','Tarif enfant (-12 ans), applicable dans les centres culturels.'),(2,'student',8.50,'2024-01-01','2024-12-31','Tarif étudiant (carte valide), similaire aux réductions théâtres/cinémas.'),(3,'senior',10.00,'2024-01-01','2024-12-31','Tarif senior (+65), aligné sur les réductions en salles bruxelloises.'),(4,'article 27',1.25,'2024-01-01','2024-12-31','Tarif Article 27 pour bénéficiaires CPAS.'),(5,'adult',15.00,'2024-01-01','2024-12-31','Tarif standard adulte.'),(6,'VIP',30.00,'2024-01-01','2024-12-31','Tarif VIP incluant placement privilégié.');
/*!40000 ALTER TABLE `prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `representation_reservations`
--

DROP TABLE IF EXISTS `representation_reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `representation_reservations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `quantity` int(11) NOT NULL,
  `price_id` bigint(20) NOT NULL,
  `representation_id` bigint(20) NOT NULL,
  `reservation_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `representation_reservations_price_id_de97d281_fk_prices_id` (`price_id`),
  KEY `representation_reser_representation_id_92943868_fk_represent` (`representation_id`),
  KEY `representation_reser_reservation_id_32cd428d_fk_reservati` (`reservation_id`),
  CONSTRAINT `representation_reser_representation_id_92943868_fk_represent` FOREIGN KEY (`representation_id`) REFERENCES `representations` (`id`),
  CONSTRAINT `representation_reser_reservation_id_32cd428d_fk_reservati` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`),
  CONSTRAINT `representation_reservations_price_id_de97d281_fk_prices_id` FOREIGN KEY (`price_id`) REFERENCES `prices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `representation_reservations`
--

LOCK TABLES `representation_reservations` WRITE;
/*!40000 ALTER TABLE `representation_reservations` DISABLE KEYS */;
INSERT INTO `representation_reservations` VALUES (1,2,1,1,1),(2,1,2,2,2);
/*!40000 ALTER TABLE `representation_reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `representations`
--

DROP TABLE IF EXISTS `representations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `representations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `schedule` datetime(6) NOT NULL,
  `location_id` bigint(20) DEFAULT NULL,
  `show_id` bigint(20) NOT NULL,
  `available_seats` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `representations_location_id_860c4ba1_fk_locations_id` (`location_id`),
  KEY `representations_show_id_90b07717_fk_shows_id` (`show_id`),
  CONSTRAINT `representations_location_id_860c4ba1_fk_locations_id` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  CONSTRAINT `representations_show_id_90b07717_fk_shows_id` FOREIGN KEY (`show_id`) REFERENCES `shows` (`id`),
  CONSTRAINT `representations_available_seats_c9741694_check` CHECK (`available_seats` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `representations`
--

LOCK TABLES `representations` WRITE;
/*!40000 ALTER TABLE `representations` DISABLE KEYS */;
INSERT INTO `representations` VALUES (1,'2012-10-12 13:30:00.000000',12,1,100),(2,'2012-10-12 20:30:00.000000',13,1,100),(3,'2012-10-02 20:30:00.000000',NULL,2,100),(4,'2012-10-16 20:30:00.000000',NULL,3,100);
/*!40000 ALTER TABLE `representations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reservations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `booking_date` datetime(6) NOT NULL,
  `status` varchar(60) NOT NULL,
  `user_id` int(11) NOT NULL,
  `quantity` int(10) unsigned NOT NULL CHECK (`quantity` >= 0),
  `representation_id` bigint(20) NOT NULL,
  `payment_status` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reservations_user_id_d03abc5b_fk_auth_user_id` (`user_id`),
  KEY `reservations_representation_id_5f66501d_fk_representations_id` (`representation_id`),
  CONSTRAINT `reservations_representation_id_5f66501d_fk_representations_id` FOREIGN KEY (`representation_id`) REFERENCES `representations` (`id`),
  CONSTRAINT `reservations_user_id_d03abc5b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES (1,'2025-11-21 21:11:36.732000','pay├®e',2,1,1,'pending'),(2,'2025-11-21 22:15:23.688000','pay├®e',2,1,1,'pending'),(3,'2025-11-21 22:15:23.700000','en attente',2,1,1,'pending');
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `review` longtext NOT NULL,
  `stars` smallint(5) unsigned NOT NULL CHECK (`stars` >= 0),
  `validated` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `show_id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_show_id_53c4ca85_fk_shows_id` (`show_id`),
  KEY `reviews_user_id_c23b0903_fk_auth_user_id` (`user_id`),
  CONSTRAINT `reviews_show_id_53c4ca85_fk_shows_id` FOREIGN KEY (`show_id`) REFERENCES `shows` (`id`),
  CONSTRAINT `reviews_user_id_c23b0903_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,'Excellent.',5,1,'2025-01-07 17:41:03.509000',NULL,1,1),(2,'Pas mal.',3,0,'2025-01-07 17:41:03.509000',NULL,2,1),(3,'Magnifique!',5,1,'2025-01-07 17:41:03.509000',NULL,1,2);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shows`
--

DROP TABLE IF EXISTS `shows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shows` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `slug` varchar(60) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `poster_url` varchar(255) DEFAULT NULL,
  `duration` smallint(5) unsigned DEFAULT NULL CHECK (`duration` >= 0),
  `created_in` smallint(5) unsigned NOT NULL,
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `unique_slug_created_in` (`slug`,`created_in`),
  KEY `shows_location_id_a6832141_fk_locations_id` (`location_id`),
  KEY `shows_artist_id_3eeaba27_fk_artists_id` (`artist_id`),
  CONSTRAINT `shows_artist_id_3eeaba27_fk_artists_id` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`),
  CONSTRAINT `shows_location_id_a6832141_fk_locations_id` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  CONSTRAINT `shows_created_in_e5770ea4_check` CHECK (`created_in` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shows`
--

LOCK TABLES `shows` WRITE;
/*!40000 ALTER TABLE `shows` DISABLE KEYS */;
INSERT INTO `shows` VALUES (1,'ayiti','Ayiti','Un homme est bloqué à l\'aéroport.\n Questionné par les douaniers, il doit alors justifier son identité, et surtout prouver qu\'il est haïtien - Qu\'est-ce qu\'être haïtien ?','ayiti.jpg',90,2010,1,'2025-01-07 17:41:03.509000',NULL,12,NULL,'Un homme est bloqué à l\'aéroport.\n Questionné par les douaniers, il doit alors justifier son identité, et surtout prouver qu\'il est haïtien - Qu\'est-ce qu\'être haïtien ?',NULL,NULL,'Ayiti',NULL,1,'approved'),(2,'cible-mouvante','Cible mouvante','Dans ce « thriller d\'anticipation », des adultes semblent alimenter et véhiculer une crainte féroce envers les enfants âgés entre 10 et 12 ans.','cible.jpg',90,2012,1,'2025-01-07 17:41:15.554000',NULL,13,NULL,'Dans ce « thriller d\'anticipation », des adultes semblent alimenter et véhiculer une crainte féroce envers les enfants âgés entre 10 et 12 ans.',NULL,NULL,'Cible mouvante',NULL,3,'approved'),(3,'ceci-nest-pas-un-chanteur-belge','Ceci n\'est pas un chanteur belge','Non peut-être ?!\nEntre Magritte (pour le surréalisme comique) et Maigret (pour le réalisme mélancolique), ce dixième opus semalien propose quatorze nouvelles chansons mêlées à de petits textes humoristiques et à quelques fortes images poétiques.','ceci-nest-pas-un-chanteur-belge.jpg',90,2014,0,'2025-01-07 17:41:15.585000',NULL,NULL,NULL,'Non peut-être ?!\nEntre Magritte (pour le surréalisme comique) et Maigret (pour le réalisme mélancolique), ce dixième opus semalien propose quatorze nouvelles chansons mêlées à de petits textes humoristiques et à quelques fortes images poétiques.',NULL,NULL,'Ceci n\'est pas un chanteur belge',NULL,10,'approved'),(4,'manneke','Manneke… !','A tour de rôle, Pierre se joue de ses oncles, tantes, grands-parents et surtout de sa mère.','manneke.jpg',90,2011,1,'2025-01-07 17:41:40.894000',NULL,14,NULL,'A tour de rôle, Pierre se joue de ses oncles, tantes, grands-parents et surtout de sa mère.',NULL,NULL,'Manneke… !',NULL,12,'approved'),(5,'du-haut-de-mon-perchoir','Du haut de mon perchoir','Un regard tendre et lucide sur le monde, porte par une parole intime, drole et poetique.',NULL,75,2026,1,'2026-04-22 18:45:00.000000',NULL,NULL,NULL,'Un regard tendre et lucide sur le monde, porte par une parole intime, drole et poetique.',NULL,NULL,'Du haut de mon perchoir',NULL,13,'approved'),(6,'le-spectacle-de-la-vie','Le spectacle de la vie','Une traversee sensible des petits instants qui nous transforment, entre humour, emotion et energie de scene.',NULL,90,2026,1,'2026-04-22 18:46:00.000000',NULL,NULL,NULL,'Une traversee sensible des petits instants qui nous transforment, entre humour, emotion et energie de scene.',NULL,NULL,'Le spectacle de la vie',NULL,5,'approved'),(7,'a-voir-et-a-revoir','A voir et a revoir','Un spectacle lumineux et rythmé, pense comme une parenthese joyeuse a revivre encore et encore.',NULL,80,2026,1,'2026-04-22 18:47:00.000000',NULL,NULL,NULL,'Un spectacle lumineux et rythmé, pense comme une parenthese joyeuse a revivre encore et encore.',NULL,NULL,'A voir et a revoir',NULL,7,'approved');
/*!40000 ALTER TABLE `shows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `types`
--

DROP TABLE IF EXISTS `types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `types` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` varchar(60) NOT NULL,
  `type_en` varchar(60) DEFAULT NULL,
  `type_fr` varchar(60) DEFAULT NULL,
  `type_nl` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `types`
--

LOCK TABLES `types` WRITE;
/*!40000 ALTER TABLE `types` DISABLE KEYS */;
INSERT INTO `types` VALUES (1,'auteur',NULL,'auteur',NULL),(2,'scénographe',NULL,'scénographe',NULL),(3,'comédien',NULL,'comédien',NULL);
/*!40000 ALTER TABLE `types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_meta`
--

DROP TABLE IF EXISTS `user_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_meta` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `langue` varchar(2) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_meta_user_id_58c29229_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_meta`
--

LOCK TABLES `user_meta` WRITE;
/*!40000 ALTER TABLE `user_meta` DISABLE KEYS */;
INSERT INTO `user_meta` VALUES (1,'en',2),(2,'fr',1);
/*!40000 ALTER TABLE `user_meta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'reservation'
--

--
-- Dumping routines for database 'reservation'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-22 19:12:25
