CREATE DATABASE  IF NOT EXISTS `barcode_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `barcode_system`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: barcode_system
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `barcodes`
--

DROP TABLE IF EXISTS `barcodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `barcodes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barcode_number` varchar(100) NOT NULL,
  `status` enum('unused','used') DEFAULT 'unused',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode_number` (`barcode_number`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barcodes`
--

LOCK TABLES `barcodes` WRITE;
/*!40000 ALTER TABLE `barcodes` DISABLE KEYS */;
INSERT INTO `barcodes` VALUES (1,'BETH-10001','used','2026-02-23 11:23:29'),(2,'BETH-10002','used','2026-02-23 11:24:22'),(3,'BETH-10003','used','2026-02-23 11:25:59'),(4,'489390594852','unused','2026-02-23 11:41:33'),(5,'256211258438','unused','2026-02-23 11:44:00'),(6,'575404396401','unused','2026-02-23 11:44:00'),(7,'470887609266','unused','2026-02-23 11:44:00'),(8,'773064737914','unused','2026-02-23 11:45:09'),(9,'354084614505','used','2026-02-23 11:45:50'),(10,'683261477769','used','2026-02-23 11:50:29'),(11,'408197205806','unused','2026-02-23 11:50:29'),(12,'103468318129','unused','2026-02-23 11:50:29'),(13,'864154676317','unused','2026-02-23 11:50:37'),(14,'860626840585','unused','2026-02-23 11:50:41'),(15,'163038174092','unused','2026-02-23 11:53:41'),(16,'729647889195','unused','2026-02-23 11:53:41'),(17,'104681595367','unused','2026-02-23 11:53:42'),(18,'553229550922','unused','2026-02-23 11:55:31'),(19,'107851691136','unused','2026-02-23 11:55:32'),(20,'717797531064','unused','2026-02-23 12:00:04'),(21,'906119331126','unused','2026-02-23 12:00:04'),(22,'407636513626','unused','2026-02-23 12:00:05'),(23,'276316879112','unused','2026-02-23 12:02:05'),(24,'673016428965','unused','2026-02-23 12:02:11'),(25,'611204387869','unused','2026-02-23 12:02:12'),(26,'230916781527','unused','2026-02-23 12:04:10'),(27,'190328981372','unused','2026-02-23 12:04:10'),(28,'836252251513','unused','2026-02-23 12:04:10'),(29,'568292557612','unused','2026-02-23 12:05:11'),(30,'513763424916','unused','2026-02-23 12:05:43'),(31,'802337370180','unused','2026-02-23 12:06:38'),(32,'766614387744','unused','2026-02-23 12:06:53'),(33,'233671699519','unused','2026-02-23 12:12:55'),(34,'850212385608','unused','2026-02-23 12:13:16'),(35,'793308521438','unused','2026-02-23 12:13:32'),(36,'419258059944','unused','2026-02-23 12:13:51'),(37,'284711568020','used','2026-02-23 12:16:22'),(38,'579445878930','unused','2026-02-23 12:16:23'),(39,'200956995050','unused','2026-02-23 12:20:19'),(40,'296626693342','unused','2026-02-23 12:21:32'),(41,'12','unused','2026-02-23 12:28:21'),(42,'915236799146','used','2026-02-23 12:30:43'),(43,'543396015746','unused','2026-02-23 12:30:43'),(44,'387494314900','unused','2026-02-23 12:30:43'),(45,'502064271791','unused','2026-02-23 12:30:44'),(46,'375822806419','unused','2026-02-23 12:36:41'),(47,'375822806418','unused','2026-02-23 12:36:58'),(48,'123','unused','2026-02-23 12:51:26'),(49,'986601004601','unused','2026-02-23 12:52:49'),(50,'772398851289','unused','2026-02-23 12:57:09'),(51,'779529626923','unused','2026-02-23 13:06:00'),(52,'203740766333','unused','2026-02-23 13:06:00'),(53,'925320240337','unused','2026-02-23 13:06:00'),(54,'454604054560','unused','2026-02-23 13:06:00'),(55,'818831218826','unused','2026-02-23 13:06:00'),(56,'888832115274','unused','2026-02-23 13:06:25'),(57,'635828980274','unused','2026-02-23 13:06:25'),(58,'365299471030','unused','2026-02-23 13:06:25'),(59,'487588615223','unused','2026-02-23 13:06:25'),(60,'359920307326','unused','2026-02-23 13:06:26'),(61,'699313030897','unused','2026-02-23 13:06:26'),(62,'864155177210','unused','2026-02-23 13:06:26'),(63,'743935369870','unused','2026-02-23 13:21:18'),(64,'190866709993','unused','2026-02-23 13:27:50'),(65,'344223685747','unused','2026-02-23 13:27:50'),(66,'298710107492','unused','2026-02-23 13:27:51'),(67,'481353443246','unused','2026-02-23 13:27:51'),(68,'1231231123','unused','2026-02-23 13:29:21'),(69,'736100735613','unused','2026-02-23 13:30:14'),(70,'3124124123','unused','2026-02-23 13:30:29'),(71,'723051066985','unused','2026-02-23 13:32:59'),(72,'134148078499','unused','2026-02-23 13:34:00'),(73,'486920571018','unused','2026-02-23 13:34:00'),(74,'205473193416','unused','2026-02-23 13:34:00'),(75,'729735577450','unused','2026-02-23 13:34:01'),(76,'503931654409','unused','2026-02-23 13:34:02'),(77,'BETH-503931654409','unused','2026-02-23 13:35:29'),(78,'529819665521','unused','2026-02-23 13:37:04'),(79,'444903522588','used','2026-02-23 13:37:04'),(80,'we','used','2026-02-23 15:13:24');
/*!40000 ALTER TABLE `barcodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barcode_number` varchar(100) DEFAULT NULL,
  `donor_name` varchar(150) DEFAULT NULL,
  `item_name` varchar(150) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `date_received` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `barcode_number` (`barcode_number`),
  CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`barcode_number`) REFERENCES `barcodes` (`barcode_number`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donations`
--

LOCK TABLES `donations` WRITE;
/*!40000 ALTER TABLE `donations` DISABLE KEYS */;
INSERT INTO `donations` VALUES (2,'BETH-10002','Ferdi','food',5,'2026-03-31','2026-02-23 11:25:22'),(3,'BETH-10003','Alex','Ice candy',100,'2026-03-05','2026-02-23 11:26:22'),(4,'354084614505','Micka','Hotdogs',13,'2026-04-10','2026-02-23 11:47:05'),(5,'683261477769','123','123',1,'2026-12-12','2026-02-23 11:51:13'),(6,'284711568020','sad','qseqwe',1,'2026-04-04','2026-02-23 12:17:02'),(7,'915236799146','Manuel','Footlongss',100,'2026-03-31','2026-02-23 12:32:08'),(8,'915236799146','Manuel','Footlongss',99,'2026-10-10','2026-02-23 13:05:32'),(9,'915236799146','Manuel','Footlongss',99,'2026-10-10','2026-02-23 13:05:34'),(10,'444903522588','Mika','Salamangca',1,'2026-03-05','2026-02-23 13:42:33'),(11,'we','312','rice 50kg',1,'2026-12-12','2026-02-23 15:13:34');
/*!40000 ALTER TABLE `donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barcode_number` varchar(255) DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `usage_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history`
--

LOCK TABLES `history` WRITE;
/*!40000 ALTER TABLE `history` DISABLE KEYS */;
INSERT INTO `history` VALUES (1,'BETH-10001','rice 50kg',1,'2026-02-23 23:45:47');
/*!40000 ALTER TABLE `history` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-24  0:06:08
