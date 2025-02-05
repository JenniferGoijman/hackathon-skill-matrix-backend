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
      const { rows } = await pg.query(`
        select u.user_id, u.email, u."name", u.seniority, u.country, us.skill_id, sc."name" 
        from public.user u
        left join public.user_skill us on us.user_id = u.user_id
        left join public.skill_catalog sc on sc.id = us.skill_id  
        where lower(u.name) like lower('%${userName}%') 
        order by us.skill_value desc 
        limit 5`);
      return rows;
    },
    checkIsAdmin: async payload => {
      const { rows } = await pg.query('check-admin', [payload]);
      return rows[0];
    },
  });
  return { start };
};
