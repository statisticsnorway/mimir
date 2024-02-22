package no.ssb.xp.xmlparser;

import org.json.JSONObject;
import org.json.XML;

public class XmlParser {
  public Object parse(final String xml) throws Exception {
    final JSONObject jsonObject = XML.toJSONObject(xml, true);

    return jsonObject.toString();
  }
}