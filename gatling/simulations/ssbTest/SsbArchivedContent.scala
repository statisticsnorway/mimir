package ssbTest

import scala.concurrent.duration._
import scala.util.Random

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class SsbArchivedContent extends Simulation {

	val urlList = csv("cms47pages.csv").random // List of URLs to visit randomly

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

	val headers_2 = Map(
		"Sec-Fetch-Dest" -> "document",
		"Sec-Fetch-Mode" -> "navigate",
		"Sec-Fetch-Site" -> "same-origin",
		"Sec-Fetch-User" -> "?1",
		"Upgrade-Insecure-Requests" -> "1")



	val randomScn = scenario("RandomUrl")
		.feed(urlList)
		.exec(http("${tittel}")
			.get("${url}") // Browse a random page
			.headers(headers_2))

	setUp(
	randomScn.inject(
		constantUsersPerSec(10).during(10.minutes) // Constant, slow load of users visiting random articles from a list of ~200
	)).protocols(httpProtocol)
}
