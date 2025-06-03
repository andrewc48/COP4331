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
	$userId = $inData["userId"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error)
	{
			returnWithError( $conn->connect_error );
	}

	else
	{
			$stmt = $conn->prepare("UPDATE Contacts SET FirstName = ? , LastName = ?, Phone = ?,Email = ?, ID = ?, UserID = ?");
			$stmt->bind_param("ssssii", $firstName, $lastName,$phone,$email,$contactID, $userId);
			$stmt->execute();
			$stmt->close();
			$conn->close();
			returnWithError("");
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