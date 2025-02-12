-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- ホスト: 127.0.0.1
-- 生成日時: 2025-02-12 05:51:21
-- サーバのバージョン： 10.4.32-MariaDB
-- PHP のバージョン: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- データベース: `coordinates_db`
--

-- --------------------------------------------------------

--
-- テーブルの構造 `click_coordinates`
--

CREATE TABLE `click_coordinates` (
  `id` int(11) NOT NULL,
  `user_id` varchar(4) NOT NULL,
  `x_coordinate` int(11) NOT NULL,
  `y_coordinate` int(11) NOT NULL,
  `click_time` float NOT NULL,
  `video_id` varchar(20) NOT NULL,
  `comment` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- テーブルのデータのダンプ `click_coordinates`
--

INSERT INTO `click_coordinates` (`id`, `user_id`, `x_coordinate`, `y_coordinate`, `click_time`, `video_id`, `comment`) VALUES
(1, '1111', 476, 140, 1.17638, '11GgnxEEyXQ', '｀｀｀１１１１１１１１１１１１１１１１'),
(5, '1111', 69, 58, 6.52646, '11GgnxEEyXQ', NULL),
(60, '1111', 355, 89, 83.501, '11GgnxEEyXQ', NULL),
(61, '1111', 121, 256, 16.5229, '11GgnxEEyXQ', 'あいうえお'),
(64, '1111', 112, 260, 3.39126, '11GgnxEEyXQ', 'っっっっｑっっっっｑ'),
(69, '1111', 511, 255, 3.28773, '11GgnxEEyXQ', '＋ｌっっっっっっっっっっっっっっっっっっっっっっっっっっっっっっｑ'),
(80, '1111', 444, 222, 60.3371, '11GgnxEEyXQ', NULL),
(144, '1111', 630, 190, 0, '11GgnxEEyXQ', NULL),
(145, '1111', 4, 194, 0, '11GgnxEEyXQ', NULL),
(146, '1111', 3, 2, 0, '11GgnxEEyXQ', NULL),
(157, '1111', 227, 217, 2.01494, '11GgnxEEyXQ', NULL),
(158, '1111', 148, 209, 5.63541, '11GgnxEEyXQ', NULL),
(159, '1111', 368, 201, 6.68614, '11GgnxEEyXQ', NULL),
(160, '1111', 368, 201, 7.15874, '11GgnxEEyXQ', NULL),
(161, '1111', 290, 249, 19.6412, '11GgnxEEyXQ', NULL),
(162, '1111', 188, 216, 20.9051, '11GgnxEEyXQ', NULL),
(163, '1111', 226, 200, 1.97867, '11GgnxEEyXQ', NULL),
(164, '1111', 390, 193, 3.53259, '11GgnxEEyXQ', NULL),
(166, '7120', 101, 122, 18.0265, 'n0tt3meYVkU', NULL),
(167, '7120', 386, 117, 55.7634, 'n0tt3meYVkU', '誰だろう？'),
(168, '7120', 487, 203, 71.1227, 'n0tt3meYVkU', '竹だ'),
(169, '7120', 472, 183, 97.6333, 'n0tt3meYVkU', '電球！'),
(170, '7120', 391, 217, 132.363, 'n0tt3meYVkU', 'このペン欲しい\n'),
(171, '7120', 387, 207, 206.492, 'n0tt3meYVkU', 'シャー芯？？'),
(172, '7120', 26, 69, 222.162, 'n0tt3meYVkU', NULL),
(173, '7120', 26, 69, 222.382, 'n0tt3meYVkU', NULL),
(174, '7120', 218, 219, 247.337, 'n0tt3meYVkU', '見えないよ～'),
(175, '7120', 30, 129, 293.068, 'n0tt3meYVkU', '確かに！'),
(176, '7120', 444, 179, 317.517, 'n0tt3meYVkU', '竹にも種類があるのかな？'),
(177, '7120', 58, 107, 369.367, 'n0tt3meYVkU', NULL),
(178, '7120', 268, 209, 581.65, 'n0tt3meYVkU', 'そうなんだ！'),
(179, '1234', 317, 120, 41.3338, 'n0tt3meYVkU', 'いきなりクイズがはじまったからもう少し流れがあると良いと思う'),
(180, '1234', 279, 121, 128.658, 'n0tt3meYVkU', 'かみすぎ'),
(181, '1234', 232, 172, 220.333, 'n0tt3meYVkU', NULL),
(182, '1234', 269, 315, 315.258, 'n0tt3meYVkU', '余談：竹の種類の説明があると生徒が食いつく？'),
(185, '1234', 216, 161, 511.888, 'n0tt3meYVkU', '授業の流れをしっかりと確認しておく'),
(186, '1234', 208, 176, 532.451, 'n0tt3meYVkU', '写真で比較した方がわかりやすい？'),
(187, '1234', 252, 221, 579.96, 'n0tt3meYVkU', '明るさが変わっているのがわかりにくい'),
(206, '1224', 552, 106, 95.1627, 'n0tt3meYVkU', '表示しなくてもいいのではないか'),
(207, '1224', 535, 130, 120.878, 'n0tt3meYVkU', '範囲選択同様'),
(208, '1224', 357, 130, 135.657, 'n0tt3meYVkU', 'これは何'),
(209, '1224', 109, 228, 151.871, 'n0tt3meYVkU', '電球ある'),
(210, '1224', 436, 111, 170.125, 'n0tt3meYVkU', 'おでこ指さしたね'),
(211, '1224', 209, 215, 244.133, 'n0tt3meYVkU', '面白いの出てきた'),
(212, '1224', 223, 227, 275.963, 'n0tt3meYVkU', '光った'),
(213, '1224', 109, 142, 410.221, 'n0tt3meYVkU', '文字書いた'),
(214, '1224', 483, 10, 429.521, 'n0tt3meYVkU', '蛍光灯でしょ'),
(215, '1224', 485, 204, 501.977, 'n0tt3meYVkU', '不思議な形'),
(216, '1224', 240, 222, 540.893, 'n0tt3meYVkU', '光った'),
(217, '1224', 122, 295, 605.262, 'n0tt3meYVkU', 'これは何'),
(218, '1224', 9, 201, 612.136, 'n0tt3meYVkU', 'フェードアウトした'),
(219, '1224', 53, 87, 615.917, 'n0tt3meYVkU', '！？（範囲選択同様）'),
(220, '5555', 396, 98, 65.5203, 'n0tt3meYVkU', '文字，少し小さい'),
(221, '5555', 516, 114, 144.553, 'n0tt3meYVkU', NULL),
(222, '5555', 159, 68, 208.807, 'n0tt3meYVkU', '何を手にしたのか，最初わからなかった．'),
(223, '5555', 218, 227, 230.983, 'n0tt3meYVkU', '何をしているか気になるので，解説しながら準備しては？'),
(224, '5555', 98, 178, 417.564, 'n0tt3meYVkU', '見えやすいように，さっとしゃがんで書いたのは良いね．'),
(225, '5555', 355, 76, 438.21, 'n0tt3meYVkU', '何をしているのかな？'),
(226, '5555', 215, 225, 230.202, 'n0tt3meYVkU', NULL),
(227, '5555', 213, 220, 237.235, 'n0tt3meYVkU', NULL),
(228, '5555', 148, 235, 265.622, 'n0tt3meYVkU', '何をしているのかな？'),
(232, '3510', 368, 226, 63.8748, 'n0tt3meYVkU', '磁石を取り外した'),
(234, '3510', 408, 227, 90.7473, 'n0tt3meYVkU', 'スクリーンにタッチして画面の切り替えをしたのだろうか'),
(235, '3510', 518, 113, 146.04, 'n0tt3meYVkU', '手書きじゃなくて文字が表示されるような資料の作りであればスクリーンと被ることがが無くなるのではと思いました'),
(236, '3510', 173, 67, 208.651, 'n0tt3meYVkU', 'へぇ！そうなんだ'),
(237, '3510', 78, 136, 355.746, 'n0tt3meYVkU', '久しぶりの黒板'),
(240, '3510', 246, 219, 577.468, 'n0tt3meYVkU', '部屋が暗いときにやったほうが良いなと思った'),
(241, '3510', 287, 219, 435.712, 'n0tt3meYVkU', '結構触られてますね'),
(258, '1111', 239, 137, 268.947, 'n0tt3meYVkU', 'なぜこれを使用するのか気になった．'),
(260, '1109', 86, 111, 28.6127, 'n0tt3meYVkU', '題名なのでもう少し上から書いてもよさそう'),
(262, '1109', 466, 164, 111.869, 'n0tt3meYVkU', '人が出てくると思った'),
(263, '1109', 435, 210, 209.439, 'n0tt3meYVkU', '竹がなんで出てきたのかが分かった'),
(265, '1109', 204, 239, 233.168, 'n0tt3meYVkU', '目の前で見せてくれるのはとても良い'),
(266, '1109', 258, 219, 368.836, 'n0tt3meYVkU', '電球が落ちそうで怖い'),
(267, '1111', 114, 111, 0, 'n0tt3meYVkU', NULL),
(268, '1111', 518, 94, 12.8272, 'n0tt3meYVkU', NULL),
(269, '1111', 453, 159, 1.67235, 'n0tt3meYVkU', NULL),
(270, '1111', 493, 159, 2.86466, 'n0tt3meYVkU', NULL),
(271, '1111', 473, 195, 3.7866, 'n0tt3meYVkU', NULL),
(297, '2222', 432, 202, 1.58246, 'n0tt3meYVkU', NULL),
(298, '2222', 457, 165, 2.53583, 'n0tt3meYVkU', NULL),
(299, '2222', 489, 185, 3.56349, 'n0tt3meYVkU', NULL),
(301, '7007', 454, 158, 36.9166, 'n0tt3meYVkU', NULL),
(302, '7007', 394, 93, 65.7246, 'n0tt3meYVkU', NULL),
(303, '7007', 113, 231, 76.4608, 'n0tt3meYVkU', NULL),
(304, '7007', 476, 163, 95.75, 'n0tt3meYVkU', NULL),
(305, '7007', 108, 231, 98.4965, 'n0tt3meYVkU', NULL),
(306, '7007', 536, 155, 118.774, 'n0tt3meYVkU', NULL),
(307, '7007', 505, 113, 138.892, 'n0tt3meYVkU', NULL),
(308, '7007', 349, 147, 142.932, 'n0tt3meYVkU', NULL),
(309, '7007', 156, 72, 207.755, 'n0tt3meYVkU', NULL),
(310, '7007', 202, 216, 225.207, 'n0tt3meYVkU', NULL),
(311, '7007', 211, 232, 232.034, 'n0tt3meYVkU', NULL),
(312, '7007', 433, 129, 242.135, 'n0tt3meYVkU', NULL),
(313, '7007', 211, 215, 246.823, 'n0tt3meYVkU', NULL),
(314, '7007', 146, 235, 260.284, 'n0tt3meYVkU', NULL),
(315, '7007', 216, 223, 271.053, 'n0tt3meYVkU', NULL),
(316, '7007', 95, 115, 350.615, 'n0tt3meYVkU', NULL),
(317, '7007', 285, 212, 389.94, 'n0tt3meYVkU', NULL),
(318, '7007', 499, 7, 404.748, 'n0tt3meYVkU', NULL),
(319, '7007', 583, 338, 415.588, 'n0tt3meYVkU', NULL),
(320, '7007', 95, 173, 422.226, 'n0tt3meYVkU', NULL),
(321, '7007', 628, 275, 436.565, 'n0tt3meYVkU', NULL),
(322, '7007', 164, 142, 458.218, 'n0tt3meYVkU', NULL),
(323, '7007', 517, 165, 489.065, 'n0tt3meYVkU', NULL),
(324, '7007', 243, 218, 530.353, 'n0tt3meYVkU', NULL),
(325, '7007', 251, 213, 540.672, 'n0tt3meYVkU', NULL),
(326, '7007', 134, 153, 550.656, 'n0tt3meYVkU', NULL),
(327, '7007', 245, 214, 579.388, 'n0tt3meYVkU', NULL),
(328, '7007', 488, 13, 593.983, 'n0tt3meYVkU', NULL),
(329, '7007', 133, 292, 602.211, 'n0tt3meYVkU', NULL),
(330, '7007', 61, 96, 616.092, 'n0tt3meYVkU', NULL),
(333, '1231', 71, 112, 10.85, 'n0tt3meYVkU', NULL),
(335, '1231', 449, 153, 36.1708, 'n0tt3meYVkU', NULL),
(336, '1231', 609, 310, 47.7221, 'n0tt3meYVkU', NULL),
(337, '1231', 20, 238, 54.8994, 'n0tt3meYVkU', NULL),
(338, '1231', 592, 159, 86.7372, 'n0tt3meYVkU', NULL),
(339, '1231', 549, 106, 92.5501, 'n0tt3meYVkU', NULL),
(340, '1231', 479, 162, 96.396, 'n0tt3meYVkU', NULL),
(341, '1231', 116, 230, 99.8917, 'n0tt3meYVkU', NULL),
(342, '1231', 540, 157, 120.607, 'n0tt3meYVkU', NULL),
(343, '1231', 593, 150, 123.518, 'n0tt3meYVkU', NULL),
(344, '1231', 453, 207, 138.054, 'n0tt3meYVkU', NULL),
(346, '1231', 213, 130, 158.886, 'n0tt3meYVkU', NULL),
(347, '1231', 439, 204, 172.213, 'n0tt3meYVkU', NULL),
(348, '1231', 436, 125, 173.33, 'n0tt3meYVkU', NULL),
(349, '1231', 167, 70, 208.071, 'n0tt3meYVkU', NULL),
(350, '1231', 223, 245, 211.549, 'n0tt3meYVkU', NULL),
(351, '1231', 101, 228, 233.809, 'n0tt3meYVkU', NULL),
(352, '1231', 221, 225, 274.617, 'n0tt3meYVkU', NULL),
(353, '1231', 449, 205, 292.106, 'n0tt3meYVkU', NULL),
(354, '1231', 78, 131, 358.73, 'n0tt3meYVkU', NULL),
(355, '1231', 188, 22, 360.056, 'n0tt3meYVkU', NULL),
(356, '1231', 113, 159, 414.573, 'n0tt3meYVkU', NULL),
(357, '1231', 583, 343, 415.579, 'n0tt3meYVkU', NULL),
(358, '1231', 613, 345, 418.466, 'n0tt3meYVkU', NULL),
(359, '1231', 96, 187, 432.071, 'n0tt3meYVkU', NULL),
(360, '1231', 499, 8, 454.728, 'n0tt3meYVkU', NULL),
(361, '1231', 536, 164, 462.962, 'n0tt3meYVkU', NULL),
(362, '1231', 519, 149, 468.948, 'n0tt3meYVkU', NULL),
(363, '1231', 111, 130, 511.818, 'n0tt3meYVkU', NULL),
(364, '1231', 242, 216, 541.667, 'n0tt3meYVkU', NULL),
(365, '1231', 485, 15, 549.077, 'n0tt3meYVkU', NULL),
(366, '1231', 542, 139, 575.68, 'n0tt3meYVkU', NULL),
(367, '1231', 127, 85, 622.464, 'n0tt3meYVkU', NULL),
(368, '1231', 326, 236, 576.086, 'n0tt3meYVkU', NULL),
(375, '3089', 283, 164, 50.2261, 'n0tt3meYVkU', NULL),
(376, '3089', 366, 242, 67.0119, 'n0tt3meYVkU', NULL),
(377, '3089', 385, 235, 91.3642, 'n0tt3meYVkU', NULL),
(378, '3089', 163, 130, 110.316, 'n0tt3meYVkU', NULL),
(379, '3089', 460, 300, 138.238, 'n0tt3meYVkU', NULL),
(380, '3089', 339, 157, 144.119, 'n0tt3meYVkU', '姿勢がぎこちない気がした．'),
(382, '3089', 218, 225, 236.178, 'n0tt3meYVkU', '生徒さんに試してもらうのもアリ？'),
(383, '3089', 138, 134, 368.892, 'n0tt3meYVkU', NULL),
(384, '3089', 143, 132, 457.883, 'n0tt3meYVkU', '授業で大切な部分は色を分けるなどしたほうがいい？'),
(386, '3089', 239, 227, 535.019, 'n0tt3meYVkU', NULL),
(387, '3089', 228, 107, 629.101, 'n0tt3meYVkU', 'どうして最初に”今日の目標”を貼らなかったのだろう？'),
(391, '8030', 148, 283, 21.1607, 'n0tt3meYVkU', 'なんか邪魔に思える\n'),
(392, '8030', 357, 211, 122.99, 'n0tt3meYVkU', NULL),
(393, '8030', 453, 192, 142.314, 'n0tt3meYVkU', NULL),
(394, '8030', 40, 150, 257.231, 'n0tt3meYVkU', NULL),
(395, '8030', 146, 139, 456.342, 'n0tt3meYVkU', '画面が暗くて見えづらい'),
(396, '8030', 276, 142, 510.756, 'n0tt3meYVkU', NULL),
(397, '8030', 309, 114, 596.791, 'n0tt3meYVkU', NULL),
(398, '8030', 376, 212, 117.42, 'n0tt3meYVkU', NULL),
(399, '8030', 391, 235, 122.545, 'n0tt3meYVkU', NULL),
(400, '8030', 151, 186, 216.719, 'n0tt3meYVkU', NULL),
(401, '8030', 154, 12, 465.767, 'n0tt3meYVkU', NULL),
(402, '8030', 243, 211, 579.576, 'n0tt3meYVkU', NULL);

-- --------------------------------------------------------

--
-- テーブルの構造 `click_counts`
--

CREATE TABLE `click_counts` (
  `id` int(11) NOT NULL,
  `user_id` char(4) NOT NULL,
  `video_id` varchar(11) NOT NULL,
  `click_count` bigint(20) UNSIGNED DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- テーブルのデータのダンプ `click_counts`
--

INSERT INTO `click_counts` (`id`, `user_id`, `video_id`, `click_count`) VALUES
(1, '1111', '11GgnxEEyXQ', 25),
(150, '1111', 'n0tt3meYVkU', 12),
(165, '7120', 'n0tt3meYVkU', 14),
(179, '1234', 'n0tt3meYVkU', 9),
(188, '1224', 'n0tt3meYVkU', 15),
(220, '5555', 'n0tt3meYVkU', 9),
(229, '3510', 'n0tt3meYVkU', 13),
(260, '1109', 'n0tt3meYVkU', 7),
(272, '2222', 'n0tt3meYVkU', 19),
(300, '7007', 'n0tt3meYVkU', 31),
(331, '1231', 'n0tt3meYVkU', 38),
(369, '3089', 'n0tt3meYVkU', 19),
(388, '8030', 'n0tt3meYVkU', 15);

-- --------------------------------------------------------

--
-- テーブルの構造 `feedbacks`
--

CREATE TABLE `feedbacks` (
  `id` int(11) NOT NULL,
  `video_id` varchar(20) NOT NULL,
  `timestamp` float NOT NULL,
  `comment` text NOT NULL,
  `record_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- テーブルのデータのダンプ `feedbacks`
--

INSERT INTO `feedbacks` (`id`, `video_id`, `timestamp`, `comment`, `record_time`) VALUES
(1, 'n0tt3meYVkU', 0, 'ｄ', '2024-12-20 08:46:34'),
(2, 'n0tt3meYVkU', 113.689, '竹が出てくると思った．（矢田貝の記録を探しているときに見つけた）', '2024-12-20 14:12:36'),
(3, 'n0tt3meYVkU', 120.171, '「とくわかったね」に対して何も思わなかった．特に意識せず聞き流した．', '2024-12-20 14:14:48'),
(4, 'n0tt3meYVkU', 120.171, '安藤「よく分かったね」に対して抑揚がない．', '2024-12-20 14:15:37'),
(5, 'n0tt3meYVkU', 120.171, '・何回も練習しているから棒読みになっているのでは？\n・学習者に対して何らかの反応・フィードバックしたほうがいい．なぜなら，（聴衆の）反応がなくなる．\n・実際に生徒がいれば（話す相手がいれば）もっと抑揚のあるリアルな反応ができたかもしれない', '2024-12-20 14:18:00'),
(6, 'n0tt3meYVkU', 121.954, '「エジソン」が縦文字だから違和感．', '2024-12-20 14:20:39'),
(7, 'n0tt3meYVkU', 121.954, '縦文字について，特に違和感なし．', '2024-12-20 14:20:58'),
(8, 'n0tt3meYVkU', 137.256, 'ホワイトボード左端のものがなにか気になった．', '2024-12-20 14:23:19'),
(9, 'n0tt3meYVkU', 145.916, '白飛びして見えない', '2024-12-20 14:24:22'),
(10, 'n0tt3meYVkU', 148.451, '板垣先生の電球についての説明が不十分なのでは？', '2024-12-20 14:25:48'),
(11, 'n0tt3meYVkU', 153.281, 'ここに電球があるってことに（板垣先生の電球の説明を聞いて）いま気づいた．', '2024-12-20 14:27:03'),
(12, 'n0tt3meYVkU', 154.164, 'ホワイトボードに書いた内容は，事前にパワーポイントで用意しておけば良いのでは？', '2024-12-20 14:28:06'),
(13, 'n0tt3meYVkU', 154.164, '本質的にはアニメーションで表示したほうが良い．\n板垣先生は，電子黒板を利用してみたいという意図があった', '2024-12-20 14:29:48'),
(14, 'n0tt3meYVkU', 154.164, '板書の時間を考えるとスライド表示より先生が書いたほうがいい場合もある', '2024-12-20 14:31:04'),
(15, 'n0tt3meYVkU', 235.203, '何をしているか説明してくれると良いかもしれない', '2024-12-20 14:37:11'),
(16, 'n0tt3meYVkU', 245.542, 'このモノの意図がわかっている（この場にいたので）ので，この黒いものに対しては気にならなかった．', '2024-12-20 14:38:26'),
(17, 'n0tt3meYVkU', 274.948, '手元の映像があっても良い．例えば右のホワイトボードを活用する', '2024-12-20 14:40:07'),
(18, 'n0tt3meYVkU', 331.531, 'たしかに，', '2024-12-20 14:43:46'),
(19, 'n0tt3meYVkU', 356.054, '生徒とのジェネレーションギャップがありそう', '2024-12-20 14:45:08'),
(20, 'n0tt3meYVkU', 378.505, '黒板：残すメディア\nホワイトボード：切り替わるメディア', '2024-12-20 14:48:29'),
(21, 'n0tt3meYVkU', 455.48, 'カメラの問題かもしれない', '2024-12-20 14:51:46'),
(22, 'n0tt3meYVkU', 592.065, '言葉があることで理解できた．\n黒板の文字のみでは説明の理解ができない．', '2024-12-20 14:57:22'),
(23, 'n0tt3meYVkU', 596.183, '先生のユラユラに対して，特に気にならなかった．', '2024-12-20 14:58:19'),
(24, 'n0tt3meYVkU', 621.423, 'そうだね．書いても良い', '2024-12-20 14:59:52');

-- --------------------------------------------------------

--
-- テーブルの構造 `feedback_speakers`
--

CREATE TABLE `feedback_speakers` (
  `feedback_id` int(11) NOT NULL,
  `user_id` varchar(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- テーブルのデータのダンプ `feedback_speakers`
--

INSERT INTO `feedback_speakers` (`feedback_id`, `user_id`) VALUES
(1, '1111'),
(2, '1109'),
(3, '1224'),
(4, '1109'),
(5, '5555'),
(6, '1224'),
(7, '5555'),
(8, '1224'),
(9, '5555'),
(10, '5555'),
(11, '1224'),
(12, '1109'),
(13, '5555'),
(14, '5555'),
(15, '5555'),
(16, '5555'),
(17, '5555'),
(18, '5555'),
(19, '5555'),
(20, '5555'),
(21, '5555'),
(22, '1224'),
(23, '1224'),
(24, '5555');

-- --------------------------------------------------------

--
-- テーブルの構造 `range_selections`
--

CREATE TABLE `range_selections` (
  `id` int(11) NOT NULL,
  `user_id` varchar(4) NOT NULL,
  `video_id` varchar(20) NOT NULL,
  `start_x` int(11) NOT NULL,
  `start_y` int(11) NOT NULL,
  `width` int(11) NOT NULL,
  `height` int(11) NOT NULL,
  `click_time` float NOT NULL,
  `comment` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- テーブルのデータのダンプ `range_selections`
--

INSERT INTO `range_selections` (`id`, `user_id`, `video_id`, `start_x`, `start_y`, `width`, `height`, `click_time`, `comment`) VALUES
(16, '1111', '11GgnxEEyXQ', 67, 90, 155, 154, 4.14225, 'かきくけこ'),
(18, '1111', '11GgnxEEyXQ', 31, 190, 24, 34, 1.23301, 'てすとが嫌い\n'),
(28, '7120', 'n0tt3meYVkU', 43, 97, 110, 62, 22.3414, '見えにくい'),
(29, '7120', 'n0tt3meYVkU', 380, 88, 198, 155, 83.3082, 'エジソンだ！！'),
(30, '7120', 'n0tt3meYVkU', 152, 175, 132, 102, 277.849, 'すごい！！！'),
(31, '7120', 'n0tt3meYVkU', 43, 100, 105, 63, 369.367, '今日の覚えておくこと'),
(32, '7120', 'n0tt3meYVkU', 41, 95, 123, 116, 420.716, 'メモする'),
(33, '7120', 'n0tt3meYVkU', 404, 106, 221, 127, 496.649, '懐かしい'),
(34, '7120', 'n0tt3meYVkU', 25, 77, 181, 21, 618.367, '目標'),
(35, '1234', 'n0tt3meYVkU', 265, 115, 134, 130, 26.3965, 'なんと言ったか聞きづらい'),
(36, '1234', 'n0tt3meYVkU', 309, 80, 286, 179, 117.505, '生徒が正解しなかったときのヒントは他にもあったのか？'),
(37, '1234', 'n0tt3meYVkU', 447, 82, 150, 55, 146.766, '書いてあることが見えにくい'),
(38, '1234', 'n0tt3meYVkU', 97, 74, 212, 212, 238.176, '事前に用意しておくべき'),
(39, '1234', 'n0tt3meYVkU', 61, 125, 214, 174, 267.619, '背景を黒にしていて見やすい'),
(40, '1234', 'n0tt3meYVkU', 56, 90, 104, 133, 419.872, '後ろの生徒が見えにくいのでは？'),
(41, '1234', 'n0tt3meYVkU', 435, 171, 140, 73, 502.358, '教室の電気で例えるとわかりやすいと思う'),
(42, '1234', 'n0tt3meYVkU', 70, 77, 172, 40, 628.687, '生徒が見返したときにすぐにわかりやすいものがいいと思う'),
(44, '1224', 'n0tt3meYVkU', 415, 116, 152, 112, 45.9143, 'なぜ黒板を使わない\nなぜプロジェクターを使う'),
(45, '1224', 'n0tt3meYVkU', 532, 122, 26, 69, 121.295, '縦文字'),
(46, '1224', 'n0tt3meYVkU', 1, 36, 143, 179, 211.957, '黒板いらないのではないか'),
(47, '1224', 'n0tt3meYVkU', 177, 203, 78, 50, 280.976, 'きれい'),
(48, '1224', 'n0tt3meYVkU', 52, 73, 212, 132, 378.505, 'プロジェクターで説明したら黒板いらなくないか'),
(49, '1224', 'n0tt3meYVkU', 62, 142, 114, 68, 590.982, '文字だけだとよくわからない'),
(50, '1224', 'n0tt3meYVkU', 25, 77, 187, 27, 619.469, 'なぜ書かない'),
(51, '5555', 'n0tt3meYVkU', 261, 115, 117, 98, 25.8141, 'ゆらゆらしている'),
(52, '5555', 'n0tt3meYVkU', 166, 190, 108, 80, 256.184, '「みんなから見やすいように背景にボードを立てますよ」とか説明があっても良いのでは？'),
(53, '5555', 'n0tt3meYVkU', 201, 214, 35, 39, 274.476, 'カメラで写してスクリーンに見せると様子がよくわかったかもしれませんね．'),
(54, '5555', 'n0tt3meYVkU', 238, 111, 122, 130, 594.462, 'やっぱりゆらゆらしているのが気になる'),
(55, '3510', 'n0tt3meYVkU', 111, 96, 149, 175, 72.362, '左右の動きが気になった'),
(56, '3510', 'n0tt3meYVkU', 367, 97, 207, 145, 138.068, 'スクリーンが見えない'),
(57, '3510', 'n0tt3meYVkU', 49, 76, 92, 33, 422.354, '今更だが，上のスペースがもったいなく感じる'),
(58, '3510', 'n0tt3meYVkU', 28, 73, 190, 41, 618.679, '上のスペース，そういうことだったんですね・・・失礼しました'),
(60, '1109', 'n0tt3meYVkU', 355, 59, 253, 206, 61.9307, 'クイズはとても良い考えだと思った'),
(61, '1109', 'n0tt3meYVkU', 379, 89, 217, 163, 154.026, 'ホワイトボードに書き込むのではなく事前にパワーポイントで準備してたら良さそう'),
(63, '1109', 'n0tt3meYVkU', 345, 78, 247, 178, 329.379, '指し棒があったら良いと思った'),
(64, '1109', 'n0tt3meYVkU', 44, 68, 191, 43, 624.056, 'なぜスペースを開けていたのかが分かった'),
(66, '1111', 'n0tt3meYVkU', 230, 184, 148, 98, 589.784, '生徒目線でなるほど！と思う内容．\nであるのに先生はスッと話を流してかつ下を向く．\nもう少し話が膨らめば興味を持つ生徒は多そう．'),
(67, '1111', 'n0tt3meYVkU', 376, 120, 214, 103, 0, '縦書きと横書きが混在しているので，どちらかに統一するべきなのでは？私なら横書きにする'),
(68, '1111', 'n0tt3meYVkU', 243, 129, 203, 130, 5.66915, 'テスト'),
(75, '2222', 'n0tt3meYVkU', 174, 107, 173, 194, 4.90857, 'コメントの編集'),
(77, '7007', 'n0tt3meYVkU', 238, 122, 101, 133, 42.587, '動きが気になる'),
(78, '1231', 'n0tt3meYVkU', 479, 96, 143, 27, 149.382, '文字が見えづらい\n右の光が反射していないスペースに書けばいいと思う'),
(79, '1231', 'n0tt3meYVkU', 57, 127, 129, 77, 623.2, '違いについても板書するべきだと思う'),
(81, '8030', 'n0tt3meYVkU', 493, 99, 68, 16, 150.562, '文脈で予想はできるが，画面が明るすぎて書いた文字が見えない');

-- --------------------------------------------------------

--
-- テーブルの構造 `scene_records`
--

CREATE TABLE `scene_records` (
  `id` int(11) NOT NULL,
  `user_id` varchar(4) NOT NULL,
  `video_id` varchar(20) NOT NULL,
  `click_time` float NOT NULL,
  `comment` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- テーブルのデータのダンプ `scene_records`
--

INSERT INTO `scene_records` (`id`, `user_id`, `video_id`, `click_time`, `comment`) VALUES
(1, '1111', '11GgnxEEyXQ', 7.93175, 'テスト記録'),
(39, '1111', '11GgnxEEyXQ', 14.571, 'お'),
(41, '1111', '11GgnxEEyXQ', 2.51725, '１２３４５'),
(51, '1111', '11GgnxEEyXQ', 11.6667, 'ｌ'),
(57, '7120', 'n0tt3meYVkU', 162.067, 'フィラメントにつかわれてたと思う！'),
(58, '7120', 'n0tt3meYVkU', 223.487, '鉛筆の芯とかも光るの？'),
(59, '7120', 'n0tt3meYVkU', 437.945, '蛍光灯'),
(60, '7120', 'n0tt3meYVkU', 541.595, '色も違う'),
(61, '1234', 'n0tt3meYVkU', 97.3007, '他の生徒にも発問させるように促すと良い'),
(62, '1234', 'n0tt3meYVkU', 188.58, '実際の写真とかあるとイメージしやすい'),
(63, '1224', 'n0tt3meYVkU', 18.7984, '画質が荒い'),
(64, '1224', 'n0tt3meYVkU', 360.823, '黒板ズームして'),
(65, '1224', 'n0tt3meYVkU', 455.48, '暗くなった？'),
(66, '1224', 'n0tt3meYVkU', 467.002, '明るくなった'),
(67, '1224', 'n0tt3meYVkU', 491.204, 'ズームして'),
(68, '5555', 'n0tt3meYVkU', 7.54909, 'ちょっと早口？'),
(69, '5555', 'n0tt3meYVkU', 118.931, '「よくわかったね」が棒読み'),
(70, '5555', 'n0tt3meYVkU', 355.121, '時代が古いのでしょうがないけど，今では使われなくなったね．'),
(71, '5555', 'n0tt3meYVkU', 439.621, '「その通り」も棒読みに聞こえちゃいますね．'),
(72, '5555', 'n0tt3meYVkU', 509.064, 'どうした？'),
(73, '5555', 'n0tt3meYVkU', 146.711, '今の白熱電球が全てエジソン電球というわけではないので，エジソン電球と今の白熱電球との違いも一言説明しては？'),
(74, '5555', 'n0tt3meYVkU', 163.692, '間のとり方が良いですね'),
(75, '5555', 'n0tt3meYVkU', 200.735, '少しテンポが悪い？'),
(76, '5555', 'n0tt3meYVkU', 301.84, '日本の竹（京都の竹だったと思いますが）が，他の素材よりも何が優れていたのかな？'),
(77, '1109', 'n0tt3meYVkU', 526.586, 'たまに声が聞こえづらい'),
(78, '1109', 'n0tt3meYVkU', 590.427, '電球と蛍光灯のそれぞれの特徴の説明がわかりやすい'),
(79, '1111', 'n0tt3meYVkU', 7.39316, 'シーン記録'),
(83, '2222', 'n0tt3meYVkU', 7.85967, 'シーン記録'),
(84, '2222', 'n0tt3meYVkU', 5.96915, 'シーン記録');

-- --------------------------------------------------------

--
-- テーブルの構造 `users`
--

CREATE TABLE `users` (
  `user_id` varchar(4) NOT NULL,
  `name` varchar(50) NOT NULL,
  `password` varchar(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- テーブルのデータのダンプ `users`
--

INSERT INTO `users` (`user_id`, `name`, `password`) VALUES
('1109', '木村', '1109'),
('1111', 'マルヤマ', '1111'),
('1224', '矢田貝涼', '1224'),
('1231', '上田', '1231'),
('1234', 'よこやま２', '1234'),
('2222', '丸山', '2222'),
('3089', 'ハマ', '3089'),
('3510', 'はまだ', '3510'),
('5555', '安藤', '5555'),
('7007', '森凌久翔', '7007'),
('7120', 'よこやま', '7120'),
('8030', '岩田', '8030');

--
-- ダンプしたテーブルのインデックス
--

--
-- テーブルのインデックス `click_coordinates`
--
ALTER TABLE `click_coordinates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- テーブルのインデックス `click_counts`
--
ALTER TABLE `click_counts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_video` (`user_id`,`video_id`);

--
-- テーブルのインデックス `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`id`);

--
-- テーブルのインデックス `feedback_speakers`
--
ALTER TABLE `feedback_speakers`
  ADD PRIMARY KEY (`feedback_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- テーブルのインデックス `range_selections`
--
ALTER TABLE `range_selections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- テーブルのインデックス `scene_records`
--
ALTER TABLE `scene_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- テーブルのインデックス `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- ダンプしたテーブルの AUTO_INCREMENT
--

--
-- テーブルの AUTO_INCREMENT `click_coordinates`
--
ALTER TABLE `click_coordinates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=403;

--
-- テーブルの AUTO_INCREMENT `click_counts`
--
ALTER TABLE `click_counts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=403;

--
-- テーブルの AUTO_INCREMENT `feedbacks`
--
ALTER TABLE `feedbacks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- テーブルの AUTO_INCREMENT `range_selections`
--
ALTER TABLE `range_selections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- テーブルの AUTO_INCREMENT `scene_records`
--
ALTER TABLE `scene_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- ダンプしたテーブルの制約
--

--
-- テーブルの制約 `click_coordinates`
--
ALTER TABLE `click_coordinates`
  ADD CONSTRAINT `click_coordinates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- テーブルの制約 `click_counts`
--
ALTER TABLE `click_counts`
  ADD CONSTRAINT `click_counts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- テーブルの制約 `feedback_speakers`
--
ALTER TABLE `feedback_speakers`
  ADD CONSTRAINT `feedback_speakers_ibfk_1` FOREIGN KEY (`feedback_id`) REFERENCES `feedbacks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `feedback_speakers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- テーブルの制約 `range_selections`
--
ALTER TABLE `range_selections`
  ADD CONSTRAINT `range_selections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- テーブルの制約 `scene_records`
--
ALTER TABLE `scene_records`
  ADD CONSTRAINT `scene_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
