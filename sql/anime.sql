-- phpMyAdmin SQL Dump
-- version 4.6.6deb4
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: 2019 年 6 月 15 日 20:18
-- サーバのバージョン： 10.1.26-MariaDB-0+deb9u1
-- PHP Version: 7.0.33-0+deb9u1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `anime`
--

-- --------------------------------------------------------

--
-- テーブルの構造 `anime`
--

CREATE TABLE `anime` (
  `tid` int(11) NOT NULL,
  `title` text NOT NULL,
  `chName` varchar(50) NOT NULL,
  `url` text NOT NULL,
  `hashTag` varchar(30) NOT NULL,
  `characterURL` text NOT NULL,
  `publicURL` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- テーブルの構造 `animeReview`
--

CREATE TABLE `animeReview` (
  `tid` int(11) NOT NULL,
  `watchDate` text NOT NULL,
  `rate` int(4) NOT NULL,
  `airtime` int(4) NOT NULL,
  `comment` text NOT NULL,
  `original` text NOT NULL,
  `genre` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- テーブルの構造 `animeStory`
--

CREATE TABLE `animeStory` (
  `id` int(11) NOT NULL,
  `TID` int(11) NOT NULL,
  `Count` int(11) NOT NULL,
  `StTime` int(11) NOT NULL,
  `EdTime` int(11) NOT NULL,
  `LastUpdate` int(11) NOT NULL,
  `SubTitle` text NOT NULL COMMENT 'サブタイトル',
  `minogashi` tinyint(4) NOT NULL DEFAULT '0' COMMENT '見逃しフラグ',
  `comment` text NOT NULL COMMENT 'ユーザコメント'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `anime`
--
ALTER TABLE `anime`
  ADD PRIMARY KEY (`tid`);

--
-- Indexes for table `animeReview`
--
ALTER TABLE `animeReview`
  ADD PRIMARY KEY (`tid`);

--
-- Indexes for table `animeStory`
--
ALTER TABLE `animeStory`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `animeStory`
--
ALTER TABLE `animeStory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2416;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
