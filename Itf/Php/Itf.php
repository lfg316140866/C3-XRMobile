<?php
session_start ();
require_once ('CmnMis/IncludeFiles.php');
require_once('Cmn/Safe.php');
include_once 'Cmn/Request.php';


$_ret="";
switch(Request::Get('method')){
		case 'SelectPicture':
			$_ret=Itf::SelectPicture();
			break;
		case 'CarWindow':
			$_ret=Itf::CarWindow();
			break;
		case 'SelectNews':
			$_ret=Itf::SelectNews();
			break;
		case 'AddReservation':
			$_ret=Itf::AddReservation();
			break;
    case 'Province':
      $_ret=Itf::Province();
      break;
    case 'City':
      $_ret=Itf::City();
      break;
    case 'Dealers':
      $_ret=Itf::Dealers();
      break;
		default:
			$_ret="{\"IsSuccess\":\"0\",\"ErrMsg\":\"不存在的方法！\"}";
			break;
}
echo $_ret;

class Itf{
//省接口
  public static function Province(){
    return SqlToJson("select province_id,province from bas_province order by sort_id desc");
  }

//城市接口
  public static function City(){
    $province_id=Request::Get('province_id');
    return SqlToJson("select city_id,city from bas_city where province_id='".$province_id."' order by sort_id desc");
  }


  //经销商查询接口
  public static function Dealers(){
    $city_id=Request::Get('city_id');
    return SqlToJson("select dealer_desc,address,sales_phone,service_phone,coord_x,coord_y from bas_dealer where city_id='".$city_id."' order by sort_id desc");
  }



	//查询活动图片
	public static function SelectPicture(){
		return SqlToJson( "select title,pic_url from inf_picture where is_show=1 and is_show=1 order by sort_id desc");
	}

	 //车型亮点图片管理接口
	public static function CarWindow() {
     return SqlToJson( "select car_id,title,car_url,third_link from inf_highlights where is_show=1 order by sort_id desc");
	}

	//查询精彩发布信息接口
	public static function SelectNews() {
		$_news_type=Request::Get('news_type');
 	return SqlToJson("select news_id,title,new_media,new_media,introdution,content,news_type,pic_url,news_time from inf_news where news_type='".$_news_type."' order by sort_id desc");
	}

	//留资接口
	public static function AddReservation(){
	$_name=Request::Get('name');
  $_sex=Request::Get('sex');
	$_phone=Request::Get('phone');
	$_site=Request::Get('site');
	$_source=Request::Get('source');
	$_sql="insert into usr_reservation(name,sex,phone,site,source,cmn_modifydate) values('".$_name."','".$_sex."','".$_phone."','".$_site."','".$_source."',now())";
	 if(DB::exeSql($_sql)){
		  return "{\"IsSuccess\":\"1\",\"ErrMsg\":\"成功\"}";
	  }
	  else
	  {
		  return "{\"IsSuccess\":\"0\",\"ErrMsg\":\"失败\"}";
	  }
	}
}
  /// <summary>
  /// 用sql语句获取数据并转换成json字符串
  /// </summary>
  /// <param name="sql">sql语句</param>
  /// <param name="curPage">当前页码</param>
  /// <param name="pageSize">每页的记录数</param>
  /// <returns>json格式的数据</returns>
  function SqlToJson($sql,$curPage="",$pageSize="") {
 
    if($curPage=="") { $curPage = Request::Get("CurPage"); }
    if($pageSize=="") { $pageSize = Request::Get("PageSize"); }

    $_recCount = DB::getFieldValue(SqlAnalyse::GetRecCountSql($sql)) ;
        
    if($curPage=="" || $pageSize=="") { $_sql = $sql ;  }
    else {
      $_sql = $sql . " limit " . ($curPage-1)*$pageSize . "," . $pageSize;
    } 
    
    $_data = "{\"IsSuccess\":\"1\",\"ErrMsg\":\"成功\",\"RecCount\":\"" . $_recCount . "\",\"data\":" . DB::getJson($_sql) . "}";

    return $_data;
  }
?>