module.exports = () => {
  const start = async ({ pg }) => ({
    fetchUsers: async () => {
      const { rows } = await pg.query('select-users');
      return rows;
    },
    fetchUserInfo: async id => {
      const { rows } = await pg.query('select-user-by-id', [id]);
      return rows[0];
    },
    insertUser: async payload => {
      const { rows } = await pg.upsert('skills.user', payload, { conflictTarget: 'user_pkey', isTargetConstraint: true });
      return rows[0];
    },
    changeUserRole: async payload => {
      const { rows } = await pg.query('update-user-role', [payload.id, payload.role]);
      return rows[0];
    },
    changeUserCountry: async payload => {
      const { rows } = await pg.query('update-user-country', [payload.id, payload.country]);
      return rows[0];
    },
    fetchLevelUserBySkill: async (id, userId) => {
      const { rows } = await pg.query('select-level-user-skill', [id, userId]);
      return rows[0];
    },
    fetchTopSkillsByUser: async userName => {
      console.log('userName', userName);
      const { rows } = await pg.query(`
        select user.user_id, user.email, user."name" as "userName", user.seniority, user.country, user_skill.skill_id, skill_catalog."name" as "skillName"
        from user
        left join user_skill on user_skill.user_id = user.user_id
        left join skill_catalog on skill_catalog.id = user_skill.skill_id  
        where lower(user.name) like lower('%${userName}%') 
        order by user_skill.skill_value desc 
        limit 5`);
      console.log('rows', rows);
      return rows;
    },
    checkIsAdmin: async payload => {
      const { rows } = await pg.query('check-admin', [payload]);
      return rows[0];
    },
  });
  return { start };
};
