SELECT
    T.TransactionInfo,
    U1.User,
    T.CreatedAt,
    T.UpdatedAt
FROM
    Transactions T
    LEFT OUTER JOIN Users U1 ON U1.UserId =(T.TransactionInfo ->> "$.from")
WHERE
    JSON_EXTRACT(T.TransactionInfo, "$.group_id") = "20";

SELECT
    T.TransactionInfo,
    JSON_ARRAYAGG(U1.User),
    T.CreatedAt,
    T.UpdatedAt
FROM
    Transactions T
    LEFT OUTER JOIN Users U1 ON U1.UserId IN (T.TransactionInfo ->> "$.to")
WHERE
    JSON_EXTRACT(T.TransactionInfo, "$.group_id") = "20"
GROUP BY
    1;

SELECT
    T.TransactionInfo,
    (
        SELECT
            U1.User
        from
            Users U1
        WHERE
            U1.UserId =(T.TransactionInfo ->> "$.from")
    ) AS FromUser,
    (
        SELECT
            JSON_ARRAYAGG(U2.User)
        from
            Users U2
        WHERE
            U2.UserId MEMBER OF(JSON_EXTRACT(T.TransactionInfo, "$.to"))
    ) AS ToUsers,
    T.CreatedAt,
    T.UpdatedAt
FROM
    Transactions T
WHERE
    JSON_EXTRACT(T.TransactionInfo, "$.group_id") = "20";

SELECT
    User
from
    Users
WHERE
    SOUNDEX('AJAY') LIKE SOUNDEX(
        CONCAT(
            (User ->> "$.first_name"),
            ' ',
            IF(
                (User ->> "$.last_name") IS NULL,
                " ",
                (User ->> "$.last_name")
            )
        )
    );

    SELECT
    T.TransactionInfo,
    (
        SELECT
            U1.User
        from
            Users U1
        WHERE
            U1.UserId =(T.TransactionInfo ->> "$.from")
    ) AS FromUser,
    (
        SELECT
            JSON_ARRAYAGG(U2.User)
        from
            Users U2
        WHERE
            U2.UserId MEMBER OF(JSON_EXTRACT(T.TransactionInfo, "$.to"))
    ) AS ToUsers,
    T.CreatedAt,
    T.UpdatedAt
FROM
    Transactions T
WHERE
    JSON_EXTRACT(T.TransactionInfo, "$.from") = "poonam.yadav@gmail.com" AND "ajay.yadav@gmail.com" MEMBER OF (JSON_EXTRACT(T.TransactionInfo,"$.to")) UNION ALL     SELECT
    T.TransactionInfo,
    (
        SELECT
            U1.User
        from
            Users U1
        WHERE
            U1.UserId =(T.TransactionInfo ->> "$.from")
    ) AS FromUser,
    (
        SELECT
            JSON_ARRAYAGG(U2.User)
        from
            Users U2
        WHERE
            U2.UserId MEMBER OF(JSON_EXTRACT(T.TransactionInfo, "$.to"))
    ) AS ToUsers,
    T.CreatedAt,
    T.UpdatedAt
FROM
    Transactions T
WHERE
    JSON_EXTRACT(T.TransactionInfo, "$.from") = "ajay.yadav@gmail.com" AND "poonam.yadav@gmail.com" MEMBER OF (JSON_EXTRACT(T.TransactionInfo,"$.to")) ;

 