<?php
	header("Access-Control-Allow-Origin: http://localhost:5500");
	header("Access-Control-Allow-Headers: Content-Type");
	header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		http_response_code(200);
		exit();
	}
	$inData = getRequestInfo();

	$contactId = $inData["contactId"];
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$phone = $inData["phone"];
	$email = $inData["email"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError( "Connection failed: " . $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName = ?, Phone = ?, Email = ? WHERE ID = ?");
		
		if ($stmt === false) {
			returnWithError("Prepare failed: " . $conn->error);
			$conn->close();
			exit();
		}

		$bindResult = $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $contactId);
		
		if ($bindResult === false) {
			returnWithError("Bind_param failed: " . $stmt->error);
			$stmt->close();
			$conn->close();
			exit();
		}

		if ($stmt->execute())
		{
			if ($stmt->affected_rows > 0)
			{
				returnWithError(""); 
			}
			else
			{
				$debug_message = sprintf("No changes made. Contact ID (%s) may not exist, or data was identical. Submitted: Name: %s %s, Phone: %s, Email: %s",
					$contactId, $firstName, $lastName, $phone, $email
				);
				returnWithError($debug_message);
			}
		}
		else
		{
			returnWithError("Execute failed: " . $stmt->error);
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