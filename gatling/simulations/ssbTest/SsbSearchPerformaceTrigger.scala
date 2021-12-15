package ssbTest

import scala.concurrent.duration._
import scala.util.Random

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class SsbSearchPerformaceTrigger extends Simulation {

	val urlList = csv("seachList.csv").random // List of URLs to visit randomly

	val httpProtocol = http
		// Load balanced address takes us through Varnish. Use non-load-balanced  
		// address for more accurate (but less realistic) performance metrics.
		.baseUrl("https://www.test.ssb.no") 
		// .baseUrl("http://localhost:8080") 
		.inferHtmlResources()
		.acceptHeader("text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
		.acceptEncodingHeader("gzip, deflate")
		.acceptLanguageHeader("nb-NO,nb;q=0.9,no-NO;q=0.8,no;q=0.6,nn-NO;q=0.5,nn;q=0.4,en-US;q=0.3,en;q=0.1")
		.userAgentHeader("SSB Ytelsestest med Gatling")

	// These header sets are taken from recording.
	val headers_1 = Map(
		"Accept" -> "application/json, text/plain, */*",
		"Sec-Fetch-Dest" -> "empty",
		"Sec-Fetch-Mode" -> "cors",
		"Sec-Fetch-Site" -> "same-origin")

	val scn = scenario("BotherTheSearch")
		.feed(urlList)
		.exec(http("request_1")
			.get("/sok?sok=${term}")
			.headers(headers_1))

	setUp(
	scn.inject(
		constantUsersPerSec(2).during(4.minutes) // Constant, slow load of users visiting front page, using the kpi calculator
	)).protocols(httpProtocol)
}