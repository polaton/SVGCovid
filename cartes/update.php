<?php
error_log("update");
exec("bash maj.sh",$out,$code);
error_log(print_r($out,true));
error_log($code);
// $output = shell_exec("python3 ../script/manualTag.py" . $_POST['fullproject']);
// error_log($output);
echo($code);
return;

?>