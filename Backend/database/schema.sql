DROP DATABASE SplitwiseDb;

CREATE DATABASE SplitwiseDb;

Use SplitwiseDb;

CREATE TABLE Users(
    User JSON,
    UserId VARCHAR(50) GENERATED ALWAYS AS (User->>"$.email") NOT NULL,
    UNIQUE INDEX UserById(UserId)
);


CREATE TABLE Transactions(
    TransactionInfo JSON,
    TransactionId VARCHAR(50) GENERATED ALWAYS AS (TransactionInfo->>"$.id") NOT NULL,
    GroupId VARCHAR(50) GENERATED ALWAYS AS (TransactionInfo->>"$.group_id"),
    UNIQUE INDEX TransactionById(TransactionId)
);

CREATE TABLE Activities(
    Activity JSON,
    ActivityId VARCHAR(50) GENERATED ALWAYS AS (Activity->"$.id") NOT NULL,
    UserId VARCHAR(50) GENERATED ALWAYS AS (Activity->"$.user_id") NOT NULL,
    GroupId VARCHAR(50) GENERATED ALWAYS AS (Activity->"$.group_id"),
    INDEX ActivityByUserId(UserId),
    INDEX ActivityByGroupId(GroupId)
);

CREATE TABLE GroupInfos(
    GroupInfo JSON,
    GroupId VARCHAR(50) GENERATED ALWAYS AS (GroupInfo->>"$.id") NOT NULL,
    UNIQUE INDEX GroupById(GroupId)
);
