<?php
        $inData = getRequestInfo();

        $firstName = $inData["firstName"];
        $lastName = $inData["lastName"];
        $phone = $inData["phone"];
        $email = $inData["email"];
        $userId = $inData["userId"];

        $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
        if ($conn->connect_error)
        {
                returnWithError( $conn->connect_error );
        }

        else
        {
                $stmt = $conn->prepare("DELETE FROM Contacts WHERE FirstName=? AND LastName=? AND Phone=? AND Email=? AND UserID=?");
                $stmt->bind_param("sssss", $firstName, $lastName,$phone,$email,$userID);
                $stmt->execute();

                if($stmt->affected_rows > 0)
                {
                        returnWithError("");
                }

                else
                {
                        returnWithError("Contact Not Found");
                }

                $stmt->close();
                $conn->close();
        }

        function getRequestInfo()
        {
                return json_decode(file_get_contents('php://input'), true);
        }

        function sendResultInfoAsJson( $obj )
        {
                header('Content-type: application/json');
                echo $obj;
        }

        function returnWithError( $err )
        {
                $retValue = '{"error":"' . $err . '"}';
                sendResultInfoAsJson( $retValue );
        }

?>