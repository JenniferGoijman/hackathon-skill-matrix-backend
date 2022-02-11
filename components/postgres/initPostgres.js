const initHandyPg = require('handy-postgres');

const { buildUpsertQuery } = require('./utils/queryBuilder');

const getFiltersSubquery = ({ skills }) => {
  let skillsLength = 0;
  let text = '';

  if (skills[0].skill) {
    text += `us.user_id in (
      select u.user_id from skills."user" u
      left join skills.user_skill us on us.user_id = u.user_id
      where`;

    skills.forEach(skillLevel => {
      if (skillLevel.skill) {
        if (skillsLength > 0) { text += 'or'; }
        text += ` (us.skill_id = ${skillLevel.skill} and us.skill_value >= ${skillLevel.level || 0}) `;
        skillsLength += 1;
      }
    });

    if (skillsLength > 0) {
      text += `group by u.user_id
      having count(*) = ${skillsLength}
      ) and`;
    }
  }

  return text;
};

module.exports = ({ configPath }) => {
  let handyPg;

  const start = async ({ config, logger }) => {
    if ((process.env.NODE_ENV === 'test' || process.env.SERVICE_ENV === 'test') && config.connection.host.includes('azure')) {
      throw new Error('Do not run tests with dev credentials');
    }
    handyPg = initHandyPg({ logger, configPath });
    const pgAPI = await handyPg.start(config);
    return {
      ...pgAPI,
      schema: config.schema,

      /**
       *  Execute an upsert operation on the specified table. The data passed
       * down to this method may contain values for all of the columns in the
       * table or just a subset of them: it's not required to pass the whole
       * object if we only want to modify part of the row.
       *
       *  In these cases where some column names are missing from the `rowData`
       * object keys, the following logic will apply:
       *
       *  - When inserting a new row, the default values will be used.
       *
       *  - When updating an existing row, the current value in that column
       *    will be preserved.
       *
       * @param {string} tableName - Name of the table where the operation
       *  will take place.
       * @param {object} rowData - Object containing the values to insert.
       *  The keys of the object must match existing column names in the
       *  selected table.
       */
      upsert: (tableName, rowData, conflictConstraint) => {
        const columnsWithValue = Object.keys(rowData)
          .filter(key => rowData[key] !== undefined);

        return pgAPI.query(
          buildUpsertQuery(tableName, columnsWithValue, conflictConstraint),
          columnsWithValue.map(key => rowData[key]),
        );
      },

      fetchAnswersByUser: id => pgAPI.query(`
        select u."name" as "userName", u.user_id as "userId", u.email, u."role" as "userRole", u.country, u.seniority,
        us.skill_id as "skillId", sc."name" as "skillName", us.skill_value as "skillValue", us.skill_subvalue as "skillSubvalue", us.interested, us.comments,
        se.id as "ecosystemId", se."name" as "ecosystemName", scl.description as "levelDescription"
        from skills."user" u
        left join skills.user_skill us on us.user_id = u.user_id
        left join skills.skill_catalog sc on sc.id = us.skill_id
        left join skills.skill_ecosystem se on se.id = sc.ecosystem
        left join skills.skill_catalog_level scl on scl.skill_id = sc.id
        where u.user_id = $1 and us.skill_value = scl.level
      `, [id]),

      fetchUsersFiltered: (filters, query, totalItems = false) => {
        const usersPerPage = 10;
        const { page, name } = query;

        return pgAPI.query(`
          select u."name", u.user_id as "id", u.email, u."role", u.country, u.seniority, count(*) OVER() AS full_count
          from skills."user" u
          left join skills.user_skill us on us.user_id = u.user_id
          left join skills.skill_catalog sc on sc.id = us.skill_id
          where ${filters.skills?.length > 0 ? getFiltersSubquery(filters) : ''}
          lower(u."name") like $1
          ${filters.skills?.[0]?.skill ? `and us.skill_id = ${filters.skills[0].skill}` : ''}
          group by u.user_id ${filters.skills?.[0]?.skill ? ', us.skill_value order by us.skill_value desc' : ''}
          ${!totalItems ? `LIMIT ${usersPerPage} OFFSET ${(page - 1) * usersPerPage}` : ''};
        `, `%${name?.toLowerCase() || ''}%`);
      },

    };
  };

  const stop = () => handyPg.stop();

  return { start, stop };
};
