-- ----------------------------
-- Table structure for note_class
-- ----------------------------
DROP TABLE IF EXISTS `note_class`;
CREATE TABLE `note_class`  (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  `name` varchar(16),
  `create_time` datetime(0) NOT NULL,
  `update_time` datetime(0) NULL
);

-- ----------------------------
-- Records of note_class
-- ----------------------------
INSERT INTO `note_class` VALUES (1, '待办事项','2021-03-31 15:17:14', NULL);
INSERT INTO `note_class` VALUES (2, '已完成事项','2021-03-31 15:17:14', NULL);
INSERT INTO `note_class` VALUES (3, '提醒事项','2021-03-31 15:17:14', NULL);


-- ----------------------------
-- Table structure for note_master
-- ----------------------------
DROP TABLE IF EXISTS `note_master`;
CREATE TABLE `note_master`  (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  `master_name` varchar(255),
  `status` tinyint(1) NOT NULL DEFAULT 0, -- 1 待办 2 已完成 3 提醒事项
  `priority` tinyint(1) NOT NULL DEFAULT 0, -- 0 无优先级，1 低，2 中，3 高
  `remark` varchar(255) NULL,    -- 备注
  `clock_time` datetime(0) NULL, -- 提醒时间
  `create_time` datetime(0) NOT NULL,
  `update_time` datetime(0) NULL,
  `finish_time` datetime(0) NULL
);