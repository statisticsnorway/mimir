package no.ssb.xp.cipher;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.IOUtils;

public class SimpleStreamCipher {
    private static byte[] linebreak = {}; // Remove Base64 encoder default linebreak
    private SecretKey key;
    private Cipher cipher;
    private Base64 coder;

    public synchronized ByteArrayOutputStream encrypt(String secretKey, String stringToEncrypt)
            throws Exception {

        if(secretKey.length()!=16){
            throw new IllegalArgumentException("secretKey must be 16 digits");
        }

        try {
            key = new SecretKeySpec(secretKey.getBytes(), "AES");
            cipher = Cipher.getInstance("AES/ECB/PKCS5Padding", "SunJCE");
            coder = new Base64(32, linebreak, false);
        } catch (Throwable t) {
            t.printStackTrace();
        }

        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] cipherText = cipher.doFinal(stringToEncrypt.getBytes());
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write(coder.encode(cipherText));
        return baos;
    }

    public synchronized String decrypt(String secretKey, String encodedString)
            throws Exception {

        if(secretKey.length()!=16){
            throw new IllegalArgumentException("secretKey must be 16 digits");
        }

        try {
            key = new SecretKeySpec(secretKey.getBytes(), "AES");
            cipher = Cipher.getInstance("AES/ECB/PKCS5Padding", "SunJCE");
            coder = new Base64(32, linebreak, false);
        } catch (Throwable t) {
            t.printStackTrace();
        }

        ByteArrayInputStream bias = new ByteArrayInputStream(encodedString.getBytes());
        byte[] encypted = coder.decode(IOUtils.toByteArray(bias));
        cipher.init(Cipher.DECRYPT_MODE, key);
        byte[] decrypted = cipher.doFinal(encypted);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write(decrypted);
        return baos.toString();
    }
}
