/*
SQLyog Enterprise v10.42 
MySQL - 5.5.5-10.1.21-MariaDB : Database - new_sms
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`new_sms` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `new_sms`;

/*Table structure for table `tb_app` */

DROP TABLE IF EXISTS `tb_app`;

CREATE TABLE `tb_app` (
  `id_app` int(11) NOT NULL AUTO_INCREMENT,
  `app_name` varchar(200) DEFAULT NULL,
  `cost_pull` int(20) DEFAULT NULL,
  `cost_push` int(20) DEFAULT NULL,
  `push_time` varchar(100) DEFAULT NULL,
  `app_create` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_app`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `tb_app` */

insert  into `tb_app`(`id_app`,`app_name`,`cost_pull`,`cost_push`,`push_time`,`app_create`) values (1,'bola',1000,10000,'1,3,5','2017-05-29 05:09:56');

/*Table structure for table `tb_apps_content` */

DROP TABLE IF EXISTS `tb_apps_content`;

CREATE TABLE `tb_apps_content` (
  `id_content` int(11) NOT NULL AUTO_INCREMENT,
  `keyword` varchar(100) DEFAULT NULL,
  `content_number` int(11) DEFAULT NULL,
  `content_field` varchar(200) DEFAULT NULL,
  `content_create` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_content`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

/*Data for the table `tb_apps_content` */

insert  into `tb_apps_content`(`id_content`,`keyword`,`content_number`,`content_field`,`content_create`) values (1,'bola',1,'Reply Bola Pertama','2017-05-29 05:09:56'),(2,'bola',2,'Reply Bola Kedua','2017-05-29 05:09:56');

/*Table structure for table `tb_dr` */

DROP TABLE IF EXISTS `tb_dr`;

CREATE TABLE `tb_dr` (
  `id_dr` int(11) NOT NULL AUTO_INCREMENT,
  `telco` varchar(20) DEFAULT NULL,
  `shortcode` varchar(20) DEFAULT NULL,
  `msisdn` varchar(20) DEFAULT NULL,
  `trx_id` varchar(50) DEFAULT NULL,
  `trx_date` varchar(50) DEFAULT NULL,
  `session_id` varchar(50) DEFAULT NULL,
  `session_date` varchar(50) DEFAULT NULL,
  `stat` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_dr`)
) ENGINE=InnoDB AUTO_INCREMENT=207 DEFAULT CHARSET=latin1;

/*Data for the table `tb_dr` */

/*Table structure for table `tb_keyword` */

DROP TABLE IF EXISTS `tb_keyword`;

CREATE TABLE `tb_keyword` (
  `id_keyword` int(11) NOT NULL AUTO_INCREMENT,
  `id_app` int(11) DEFAULT NULL,
  `keyword` varchar(100) DEFAULT NULL,
  `keyword_status` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_keyword`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `tb_keyword` */

insert  into `tb_keyword`(`id_keyword`,`id_app`,`keyword`,`keyword_status`) values (1,1,'bola','1');

/*Table structure for table `tb_members` */

DROP TABLE IF EXISTS `tb_members`;

CREATE TABLE `tb_members` (
  `id_member` int(11) NOT NULL AUTO_INCREMENT,
  `telco` varchar(100) DEFAULT NULL,
  `shortcode` varchar(100) DEFAULT NULL,
  `msisdn` varchar(20) DEFAULT NULL,
  `app` varchar(100) DEFAULT NULL,
  `join_date` varchar(50) DEFAULT NULL,
  `reg_types` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_member`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Data for the table `tb_members` */

/*Table structure for table `tb_mo` */

DROP TABLE IF EXISTS `tb_mo`;

CREATE TABLE `tb_mo` (
  `id_mo` int(11) NOT NULL AUTO_INCREMENT,
  `telco` varchar(20) DEFAULT NULL,
  `shortcode` varchar(20) DEFAULT NULL,
  `msisdn` varchar(20) DEFAULT NULL,
  `sms_field` varchar(200) DEFAULT NULL,
  `keyword` varchar(50) DEFAULT NULL,
  `trx_id` varchar(50) DEFAULT NULL,
  `trx_date` varchar(50) DEFAULT NULL,
  `session_id` varchar(50) DEFAULT NULL,
  `session_date` varchar(50) DEFAULT NULL,
  `reg_type` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_mo`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=latin1;

/*Data for the table `tb_mo` */

insert  into `tb_mo`(`id_mo`,`telco`,`shortcode`,`msisdn`,`sms_field`,`keyword`,`trx_id`,`trx_date`,`session_id`,`session_date`,`reg_type`) values (44,'xl','98123','6285966622111','reg bola','bola','111111111','2017-05-12','5957372a7f85f613f4d8e579','2017-07-01 05-46-18','1'),(45,'xl','98123','6285966622112','reg bola','bola','111111112','2017-05-12','5957372f7f85f613f4d8e57f','2017-07-01 05-46-23','1');

/*Table structure for table `tb_sms_push` */

DROP TABLE IF EXISTS `tb_sms_push`;

CREATE TABLE `tb_sms_push` (
  `id_push` int(11) NOT NULL AUTO_INCREMENT,
  `telco` varchar(20) DEFAULT NULL,
  `shortcode` varchar(20) DEFAULT NULL,
  `msisdn` varchar(20) DEFAULT NULL,
  `sms_field` varchar(200) DEFAULT NULL,
  `keyword` varchar(100) DEFAULT NULL,
  `content_number` int(11) DEFAULT NULL,
  `content_field` varchar(200) DEFAULT NULL,
  `trx_id` varchar(100) DEFAULT NULL,
  `trx_date` varchar(20) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `session_date` varchar(20) DEFAULT NULL,
  `reg_type` varchar(10) DEFAULT NULL,
  `type` varchar(10) DEFAULT NULL,
  `cost` varchar(10) DEFAULT NULL,
  `send_status` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_push`)
) ENGINE=InnoDB AUTO_INCREMENT=286 DEFAULT CHARSET=latin1;

/*Data for the table `tb_sms_push` */

/*Table structure for table `tb_telco_config` */

DROP TABLE IF EXISTS `tb_telco_config`;

CREATE TABLE `tb_telco_config` (
  `id_telco` int(11) NOT NULL AUTO_INCREMENT,
  `telco_name` varchar(50) DEFAULT NULL,
  `push_limit` int(11) DEFAULT NULL,
  `address` varchar(250) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `shortname` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_telco`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `tb_telco_config` */

insert  into `tb_telco_config`(`id_telco`,`telco_name`,`push_limit`,`address`,`username`,`password`,`shortname`) values (1,'xl',3,'http://localhost/simulator-php/push.php','adminDB','passwordDb','ddd');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
