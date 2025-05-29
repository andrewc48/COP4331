
<?php

	$inData = getRequestInfo();
	
	$login = $inData["login"];
	$password = $inData["password"];
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];


	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}

	else
	{
		$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
		$stmt->bind_param("s",$login);
		$stmt->execute();
		$result = $stmt->get_result();

		if( $row = $result->fetch_assoc()  )
		{
			returnWithError("Username already taken");
;
		}
		else
		{
			$stmt = $conn->prepare("INSERT into Users (login,password,firstName,lastName) VALUES(?,?,?,?)");
			$stmt->bind_param("ssss",$login,$password,$firstName,$lastName);
			$stmt->execute();
			$id = $stmt->insert_id;
			returnWithInfo($firstName,$lastName, $id);
			
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
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
