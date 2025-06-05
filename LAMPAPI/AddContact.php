<?php
	header("Access-Control-Allow-Origin: http://www.cop4331-summer25-g19.org");
	header("Access-Control-Allow-Headers: Content-Type");
	header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		http_response_code(200);
		exit();
	}
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
		$stmt = $conn->prepare("INSERT into Contacts (FirstName, LastName, Phone,Email, UserID ) VALUES(?,?,?,?,?)");
		$stmt->bind_param("ssssi", $firstName, $lastName,$phone,$email,$userId);
		$stmt->execute();

		if ($stmt->affected_rows < 1)
		{
			$errorMsg = "Failed to add contact. Details: " . 
						"FirstName: " . $firstName . ", " .
						"LastName: " . $lastName . ", " .
						"Phone: " . $phone . ", " .
						"Email: " . $email . ", " .
						"UserID: " . $userId;
			returnWithError($errorMsg);
		}
		else
		{
			returnWithError("");
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
