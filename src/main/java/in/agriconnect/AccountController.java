package in.agriconnect;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.*;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
public class AccountController {
    private final JdbcTemplate db;
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder();
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    public AccountController(JdbcTemplate db) { this.db = db; }

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String,Object> register(@RequestBody Map<String,String> body, HttpServletRequest request) {
        String name = clean(body.get("fullName"), 120);
        String email = clean(body.get("email"), 190).toLowerCase(Locale.ROOT);
        String password = body.getOrDefault("password", "");
        String language = clean(body.getOrDefault("preferredLanguage", "en"), 12);
        if (name.length() < 2 || !EMAIL.matcher(email).matches() || password.length() < 10 || password.length() > 72)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a name, valid email, and password of 10–72 characters.");
        try {
            db.update("INSERT INTO users(full_name,email,password_hash,role,preferred_language) VALUES(?,?,?,'FARMER',?)",
                    name, email, passwords.encode(password), language.isBlank() ? "en" : language);
        } catch (DuplicateKeyException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
        Long id = db.queryForObject("SELECT id FROM users WHERE email=?", Long.class, email);
        HttpSession old = request.getSession(false); if (old != null) old.invalidate();
        request.getSession(true).setAttribute("userId", id);
        return currentUser(id);
    }

    @PostMapping("/auth/login")
    public Map<String,Object> login(@RequestBody Map<String,String> body, HttpServletRequest request) {
        String email = clean(body.get("email"), 190).toLowerCase(Locale.ROOT);
        String password = body.getOrDefault("password", "");
        List<Map<String,Object>> rows = db.queryForList("SELECT id,password_hash FROM users WHERE email=?", email);
        if (rows.isEmpty() || !passwords.matches(password, String.valueOf(rows.get(0).get("password_hash"))))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.");
        Long id = ((Number)rows.get(0).get("id")).longValue();
        HttpSession old = request.getSession(false); if (old != null) old.invalidate();
        request.getSession(true).setAttribute("userId", id);
        return currentUser(id);
    }

    @PostMapping("/auth/logout")
    public Map<String,Object> logout(HttpSession session) { session.invalidate(); return Map.of("ok", true); }

    @GetMapping("/auth/me")
    public Map<String,Object> me(HttpSession session) {
        Object id = session.getAttribute("userId");
        if (!(id instanceof Number)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in.");
        return currentUser(((Number)id).longValue());
    }

    @GetMapping("/expenses")
    public List<Map<String,Object>> expenses(HttpSession session) {
        long uid = userId(session);
        return db.queryForList("SELECT id,item_name AS item,category,amount,expense_date AS date,crop_name AS crop,notes FROM farm_expenses WHERE user_id=? ORDER BY expense_date DESC,id DESC", uid);
    }

    @PostMapping("/expenses")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String,Object> addExpense(@RequestBody Map<String,Object> body, HttpSession session) {
        long uid = userId(session);
        String item = clean(String.valueOf(body.getOrDefault("item", "")), 160);
        String category = clean(String.valueOf(body.getOrDefault("category", "Other")), 80);
        BigDecimal amount = decimal(body.get("amount"));
        String dateText = clean(String.valueOf(body.getOrDefault("date", "")), 10);
        if (item.isBlank() || amount.signum() < 0 || dateText.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter item, non-negative amount, and date.");
        Date date;
        try { date = Date.valueOf(dateText); } catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date must use YYYY-MM-DD."); }
        String crop = clean(String.valueOf(body.getOrDefault("crop", "")), 120);
        String notes = clean(String.valueOf(body.getOrDefault("notes", "")), 2000);
        db.update("INSERT INTO farm_expenses(user_id,item_name,category,amount,expense_date,crop_name,notes) VALUES(?,?,?,?,?,?,?)", uid,item,category,amount,date,crop.isBlank()?null:crop,notes.isBlank()?null:notes);
        return Map.of("ok", true, "id", db.queryForObject("SELECT LAST_INSERT_ID()", Long.class));
    }

    @DeleteMapping("/expenses/{id}")
    public Map<String,Object> deleteExpense(@PathVariable long id, HttpSession session) {
        int count = db.update("DELETE FROM farm_expenses WHERE id=? AND user_id=?", id, userId(session));
        if (count == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found.");
        return Map.of("ok", true);
    }

    @GetMapping("/finance/revenue")
    public Map<String,Object> revenue(HttpSession session){long uid=userId(session);List<Map<String,Object>> rows=db.queryForList("SELECT revenue FROM farm_financial_summary WHERE user_id=?",uid);return Map.of("revenue",rows.isEmpty()?BigDecimal.ZERO:rows.get(0).get("revenue"));}

    @PutMapping("/finance/revenue")
    public Map<String,Object> saveRevenue(@RequestBody Map<String,Object> body,HttpSession session){long uid=userId(session);BigDecimal amount=decimal(body.get("revenue"));if(amount.signum()<0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Revenue cannot be negative.");db.update("INSERT INTO farm_financial_summary(user_id,revenue) VALUES(?,?) ON DUPLICATE KEY UPDATE revenue=VALUES(revenue)",uid,amount);return Map.of("ok",true,"revenue",amount);}

    @GetMapping("/activities")
    public List<Map<String,Object>> activities(HttpSession session) {
        return db.queryForList("SELECT id,activity_title AS title,activity_date AS date,crop_name AS crop,notes,completed FROM crop_activities WHERE user_id=? ORDER BY activity_date,id", userId(session));
    }

    @PostMapping("/activities")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String,Object> addActivity(@RequestBody Map<String,Object> body, HttpSession session) {
        long uid=userId(session); String title=clean(String.valueOf(body.getOrDefault("title", "")),180);
        String dateText=clean(String.valueOf(body.getOrDefault("date", "")),10);
        if(title.isBlank()||dateText.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Enter an activity and date.");
        Date date; try{date=Date.valueOf(dateText);}catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Date must use YYYY-MM-DD.");}
        db.update("INSERT INTO crop_activities(user_id,crop_name,activity_title,activity_date,notes) VALUES(?,?,?,?,?)",uid,clean(String.valueOf(body.getOrDefault("crop", "")),120),title,date,clean(String.valueOf(body.getOrDefault("notes", "")),2000));
        return Map.of("ok",true,"id",db.queryForObject("SELECT LAST_INSERT_ID()",Long.class));
    }

    @DeleteMapping("/activities/{id}")
    public Map<String,Object> deleteActivity(@PathVariable long id,HttpSession session){int n=db.update("DELETE FROM crop_activities WHERE id=? AND user_id=?",id,userId(session));if(n==0)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Activity not found.");return Map.of("ok",true);}

    @GetMapping("/inventory")
    public List<Map<String,Object>> inventory(HttpSession session){return db.queryForList("SELECT id,item_name AS item,quantity,unit,notes FROM inventory_items WHERE user_id=? ORDER BY item_name",userId(session));}

    @PostMapping("/inventory")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String,Object> addInventory(@RequestBody Map<String,Object> body,HttpSession session){long uid=userId(session);String item=clean(String.valueOf(body.getOrDefault("item", "")),160),unit=clean(String.valueOf(body.getOrDefault("unit", "")),40);BigDecimal qty=decimal(body.get("quantity"));if(item.isBlank()||unit.isBlank()||qty.signum()<0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Enter an item, unit, and non-negative quantity.");db.update("INSERT INTO inventory_items(user_id,item_name,quantity,unit,notes) VALUES(?,?,?,?,?)",uid,item,qty,unit,clean(String.valueOf(body.getOrDefault("notes", "")),2000));return Map.of("ok",true,"id",db.queryForObject("SELECT LAST_INSERT_ID()",Long.class));}

    @DeleteMapping("/inventory/{id}")
    public Map<String,Object> deleteInventory(@PathVariable long id,HttpSession session){int n=db.update("DELETE FROM inventory_items WHERE id=? AND user_id=?",id,userId(session));if(n==0)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Inventory item not found.");return Map.of("ok",true);}

    private long userId(HttpSession session) {
        Object id = session.getAttribute("userId");
        if (!(id instanceof Number)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in.");
        return ((Number)id).longValue();
    }
    private Map<String,Object> currentUser(long id) {
        return db.queryForMap("SELECT id,full_name AS fullName,email,role,preferred_language AS preferredLanguage,created_at AS createdAt FROM users WHERE id=?", id);
    }
    private static String clean(String s, int max) { if (s == null) return ""; s=s.trim(); return s.length()>max?s.substring(0,max):s; }
    private static BigDecimal decimal(Object o) { try { BigDecimal n=new BigDecimal(String.valueOf(o)); if(n.precision()>12 || n.scale()>2) throw new Exception(); return n; } catch(Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Amount must be a valid number with at most two decimal places."); } }
}
