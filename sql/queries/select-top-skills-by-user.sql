select u.user_id, u.email, u."name", u.seniority, u.country, us.skill_id, sc."name" 
from skills.user u
left join skills.user_skill us on us.user_id = u.user_id
left join skills.skill_catalog sc on sc.id = us.skill_id  
where lower(u.name) like lower('$1') 
order by us.skill_value desc 
limit 5