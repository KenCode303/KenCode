

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._
import io.gatling.core.feeder._
import java.util.{Calendar, Date}
import scala.util.Random
import java.util.concurrent.atomic.AtomicInteger 



  

class LoadTest extends Simulation {

	val httpProtocol = http
		.baseUrl("http://127.0.0.1:9000")
		.inferHtmlResources()
		.acceptHeader("*/*")
		.acceptEncodingHeader("gzip, deflate")
		.acceptLanguageHeader("de,en-US;q=0.7,en;q=0.3")
		.contentTypeHeader("application/json;charset=UTF-8")
		.userAgentHeader("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0")

val id = new AtomicInteger(1000)
	val userId: Iterator[Map[String, Int]] = Iterator.continually(Map("id" -> id.getAndIncrement()))

	val scn = scenario("LoadTest")
		.feed(userId)
		.exec(http("gps_data")
			.post("/api/gpsdata")
			.body(StringBody("""{
			     "id" : ${id},
			   "time" : "1223456",
			   "lat" : "34.1234",
			   "lon" : "47.1234"
		   }""")).asJson)

	setUp(scn.inject(atOnceUsers(500))).protocols(httpProtocol)
}