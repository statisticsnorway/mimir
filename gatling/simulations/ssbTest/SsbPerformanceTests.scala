package ssbTest

import scala.concurrent.duration._
import scala.util.Random

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class SsbPerformanceTests extends Simulation {

	val urlList = csv("urlList.csv").random // List of URLs to visit randomly
	val kpiYear = csv("kpiSearchYear.csv").random // Pick a random year for the calculator to chew on
	val kpiSum = Iterator.continually(Map("sum" -> (Random.nextInt(5000000)))) // Random number for kpi calculator

	val httpProtocol = http
		// Load balanced address takes us through Varnish. Use non-load-balanced  
		// address for more accurate (but less realistic) performance metrics.
		.baseUrl("https://www.qa.ssb.no") 
		.inferHtmlResources()
		.acceptHeader("text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
		.acceptEncodingHeader("gzip, deflate")
		.acceptLanguageHeader("nb-NO,nb;q=0.9,no-NO;q=0.8,no;q=0.6,nn-NO;q=0.5,nn;q=0.4,en-US;q=0.3,en;q=0.1")
		.userAgentHeader("SSB Ytelsestest med Gatling")

	// These header sets are taken from recording.
	val headers_0 = Map(
		"Sec-Fetch-Dest" -> "document",
		"Sec-Fetch-Mode" -> "navigate",
		"Sec-Fetch-Site" -> "none",
		"Sec-Fetch-User" -> "?1",
		"Upgrade-Insecure-Requests" -> "1")

	val headers_1 = Map(
		"Accept" -> "application/json, text/plain, */*",
		"Sec-Fetch-Dest" -> "empty",
		"Sec-Fetch-Mode" -> "cors",
		"Sec-Fetch-Site" -> "same-origin")

	val headers_2 = Map(
		"Sec-Fetch-Dest" -> "document",
		"Sec-Fetch-Mode" -> "navigate",
		"Sec-Fetch-Site" -> "same-origin",
		"Sec-Fetch-User" -> "?1",
		"Upgrade-Insecure-Requests" -> "1")



	val scn = scenario("RecordedSimulation")
		.exec(http("request_0")
			.get("/")
			.headers(headers_0))
		.pause(1, 10) // Random think time, to create test variation
		.feed(kpiYear, 2) // Note the 2, meaning it fetches two instances of the random year. 
		.feed(kpiSum)
		.exec(http("request_1")
			.get("/_/service/mimir/kpi?startValue=${sum}&startYear=${year1}&startMonth=01&endYear=${year2}&endMonth=12&language=nb")
			.headers(headers_1))

	val kpiScn = scenario("ReadKpiNewsUser")
		.exec(http("kpiStatistic")
			.get("/priser-og-prisindekser/konsumpriser/statistikk/konsumprisindeksen") // Today's hottest news item
			.headers(headers_2))

	val randomScn = scenario("RandomUrl")
		.feed(urlList)
		.exec(http("readArticle")
			.get("${url}") // Browse a random page
			.headers(headers_2))

	setUp(
	scn.inject(
		constantUsersPerSec(2).during(10.minutes) // Constant, slow load of users visiting front page, using the kpi calculator
	),
	kpiScn.inject(
		rampUsersPerSec(10).to(30).during(10.minutes), // Gradually increasing load of users checking the latest KPI article
	),
	randomScn.inject(
		constantUsersPerSec(1).during(10.minutes) // Constant, slow load of users visiting random articles from a list of ~200
	)).protocols(httpProtocol)
}