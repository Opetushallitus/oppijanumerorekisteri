package fi.vm.sade.oppijanumerorekisteri.audit;

import com.google.gson.JsonObject;

import fi.vm.sade.auditlog.User;

import java.net.InetAddress;

public class Oauth2User extends User {
   private final String username;
   private final InetAddress ip;
   private final String userAgent;

   public Oauth2User(String username, InetAddress ip, String userAgent) {
      super(null, ip, "", userAgent);
      this.username = username;
      this.ip = ip;
      this.userAgent = userAgent;
   }

   @Override
   public JsonObject asJson() {
      JsonObject o = new JsonObject();
      o.addProperty("oid", this.username);
      o.addProperty("ip", this.ip.getHostAddress());
      o.addProperty("userAgent", this.userAgent);
      return o;
   }
}
