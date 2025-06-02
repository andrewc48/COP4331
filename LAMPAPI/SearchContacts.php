<?php
	header("Access-Control-Allow-Origin: http://localhost:5500");
	header("Access-Control-Allow-Headers: Content-Type");
	header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		http_response_code(200);
		exit();
	}
	$inData = getRequestInfo();
	
	$searchResults = "";
	$searchCount = 0;

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$trimmedSearch = isset($inData["search"]) ? trim($inData["search"]) : "";

		if (empty($trimmedSearch))
		{
			// Search term is empty or whitespace, fetch all contacts for the user
			$stmt = $conn->prepare("select firstName,lastName,Phone, Email from Contacts where UserID=?");
			$stmt->bind_param("s", $inData["userId"]);
		}
		else
		{
			// Search term is provided, use existing logic
			$stmt = $conn->prepare("select firstName,lastName,Phone, Email from Contacts where (firstName like ? or lastName LIKE ?) and UserID=?");
			$Name = "%" . $trimmedSearch . "%";
			$stmt->bind_param("sss", $Name, $Name, $inData["userId"]);
		}
		$stmt->execute();
		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;
			$searchResults .= '{"firstName":"' . $row["firstName"] . '","lastName":"' . $row["lastName"] . '","Phone":"' . $row["Phone"] . '","Email":"' . $row["Email"] . '"}';

		}
		
		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
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
	
	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>