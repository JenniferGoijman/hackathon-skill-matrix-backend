/* eslint-disable no-restricted-syntax */
const debug = require('debug')('skill-matrix:controller:catalog');

module.exports = () => {
  const start = async ({ store, logger }) => {
    const fetchEcosystems = async () => {
      logger.info('Fetching skills by ecosystems');
      debug('Fetching skills by ecosystems');
      return store.catalog.fetchEcosystems();
    };

    const insertEcosystem = async payload => {
      logger.info('Creating a new ecosystem');
      debug('Creating a new ecosystem');
      const { name: ecosystemName, skills } = payload;
      const { id: ecosystemId } = await store.catalog.insertEcosystem({ name: ecosystemName });

      for await (const skill of skills) {
        debug('Creating a new skill');
        const {
          name: skillName, type: skillType, role: skillRole, description: skillDescription, levels,
        } = skill;
        const newSkill = {
          name: skillName, type: skillType, role: skillRole, description: skillDescription, ecosystem: ecosystemId,
        };
        const { id: skillId } = await store.catalog.insertSkill(newSkill);

        for await (const level of levels) {
          debug('Creating a new skill level');
          level.skill_id = skillId;
          await store.catalog.insertSkillLevel(level);
        }
      }
      return store.catalog.fetchEcosystemById(ecosystemId);
    };

    const updateEcosystem = async (id, payload) => {
      logger.info('Update an existing ecosystem');
      return store.catalog.updateEcosystem(id, payload);
    };

    const deleteEcosystem = async id => {
      logger.info('Deleting an ecosystem');
      return store.catalog.deleteEcosystem(id);
    };

    const fetchSkills = async () => {
      logger.info('Fetching skills');
      debug('Fetching skills');
      return store.catalog.fetchSkills();
    };

    const insertSkill = async payload => {
      logger.info('Creating a new skill');
      return store.catalog.insertSkill(payload);
    };

    const updateSkill = async (id, payload) => {
      logger.info('Update an existing skill');
      return store.catalog.updateSkill(id, payload);
    };

    const deleteSkill = async id => {
      logger.info('Deleting a skill');
      return store.catalog.deleteSkill(id);
    };

    const insertSkillLevel = async payload => {
      logger.info('Creating a new skill level');
      return store.catalog.insertSkillLevel(payload);
    };

    const updateSkillLevel = async (id, payload) => {
      logger.info('Creating a new skill level');
      return store.catalog.updateSkillLevel(id, payload);
    };

    const deleteSkillLevel = async id => {
      logger.info('Deleting a skill level');
      return store.catalog.deleteSkillLevel(id);
    };

    return {
      fetchEcosystems,
      insertEcosystem,
      updateEcosystem,
      deleteEcosystem,
      fetchSkills,
      insertSkill,
      updateSkill,
      deleteSkill,
      insertSkillLevel,
      updateSkillLevel,
      deleteSkillLevel,
    };
  };
  return { start };
};
