package no.ssb.xp.xmlparser;

import java.util.Iterator;

import org.json.JSONArray;
import org.json.JSONObject;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class XmlMapper implements MapSerializable {
  final JSONObject json;

  public XmlMapper(final JSONObject json) {
    this.json = json;
  }

  @Override
  public void serialize(final MapGenerator gen) {
    traverse(gen, json);
  }

  private void traverse(final MapGenerator gen, final JSONObject json) {
    final Iterator<String> keys = json.keys();

    while (keys.hasNext()) {
      final String key = keys.next();

      final Object obj = json.get(key);
      if (obj instanceof JSONObject) {
        gen.map(key);
        traverse(gen, (JSONObject) obj);
        gen.end();
      } else if (obj instanceof JSONArray) {
        gen.array(key);
        traverseArray(key, gen, (JSONArray) obj);
        gen.end();
      } else {
        gen.value(key, obj);
      }
    }
  }

  private void traverseArray(final String key, final MapGenerator gen, final JSONArray array) {
    for (final Object obj : array) {
      if (obj instanceof JSONObject) {
        gen.map();
        traverse(gen, (JSONObject) obj);
        gen.end();
      } else if (obj instanceof JSONArray) {
        gen.array(key);
        traverseArray(null, gen, (JSONArray) obj);
        gen.end();
      } else {
        gen.value(obj);
      }
    }
  }
}