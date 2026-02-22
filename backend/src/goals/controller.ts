import { Request, Response } from 'express';

import { getErrorMessage } from '../common/utils';
import { createChildLogger } from '../config/logger';
import { GoalService } from './service';
import { CreateGoalRequest, GetGoalsQuery, UpdateGoalRequest } from './types/interface';

export class GoalController {
  private goalService: GoalService;
  private logger = createChildLogger({ controller: 'GoalController' });

  constructor(goalService: GoalService) {
    this.goalService = goalService;
  }

  getGoals = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'getGoals' });

    try {
      const userId = req.body.user?.userId ?? '';
      delete req.body.user;
      const query: GetGoalsQuery = req.query as unknown as GetGoalsQuery;

      requestLogger.info({ userId }, 'Getting goals');

      // Convert numeric query params
      if (query.page) {
        query.page = parseInt(String(query.page), 10);
      }

      if (query.limit) {
        query.limit = parseInt(String(query.limit), 10);
      }

      const goals = await this.goalService.getGoals(userId, query);

      requestLogger.info({ userId }, 'Goals fetched successfully');

      res.status(200).json(goals);
    } catch (error: unknown) {
      requestLogger.error({ error }, 'Error fetching goals');
      res.status(500).json({ error: 'Failed to fetch goals' });
    }
  };

  getGoalById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { id } = req.params;

      try {
        const goal = await this.goalService.getGoalById(id, userId);
        res.status(200).json(goal);
      } catch (error: unknown) {
        if (getErrorMessage(error) === 'Goal not found') {
          res.status(404).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error fetching goal:');
      res.status(500).json({ error: 'Failed to fetch goal' });
    }
  };

  createGoal = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'createGoal' });

    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const goalData: CreateGoalRequest = req.body;

      requestLogger.info({ userId, goalName: goalData.name, type: goalData.type }, 'Creating goal');

      // Basic validation
      if (
        !goalData.name ||
        !goalData.type ||
        goalData.targetAmount === undefined ||
        goalData.currentAmount === undefined ||
        !goalData.startDate ||
        !goalData.targetDate ||
        goalData.priority === undefined
      ) {
        requestLogger.warn({ userId }, 'Goal creation failed: Missing required fields');
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      try {
        const goal = await this.goalService.createGoal(userId, goalData);

        requestLogger.info(
          {
            userId,
            goalId: goal.id,
            goalName: goalData.name,
            type: goalData.type,
            targetAmount: goalData.targetAmount,
          },
          'Goal created successfully',
        );

        res.status(201).json(goal);
      } catch (error: unknown) {
        if (
          getErrorMessage(error).includes('date') ||
          getErrorMessage(error).includes('amount') ||
          getErrorMessage(error).includes('priority')
        ) {
          requestLogger.warn(
            { userId, error: getErrorMessage(error) },
            'Goal creation failed: Validation error',
          );
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      requestLogger.error({ error }, 'Error creating goal');
      res.status(500).json({ error: 'Failed to create goal' });
    }
  };

  updateGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { id } = req.params;
      const updates: UpdateGoalRequest = req.body;

      try {
        const goal = await this.goalService.updateGoal(id, userId, updates);
        res.status(200).json(goal);
      } catch (error: unknown) {
        if (getErrorMessage(error) === 'Goal not found') {
          res.status(404).json({ error: getErrorMessage(error) });
        } else if (
          getErrorMessage(error).includes('date') ||
          getErrorMessage(error).includes('amount') ||
          getErrorMessage(error).includes('priority')
        ) {
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error updating goal:');
      res.status(500).json({ error: 'Failed to update goal' });
    }
  };

  deleteGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { id } = req.params;

      try {
        await this.goalService.deleteGoal(id, userId);
        res.status(204).send();
      } catch (error: unknown) {
        if (getErrorMessage(error) === 'Goal not found') {
          res.status(404).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error deleting goal:');
      res.status(500).json({ error: 'Failed to delete goal' });
    }
  };

  completeGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { id } = req.params;

      try {
        const goal = await this.goalService.completeGoal(id, userId);
        res.status(200).json(goal);
      } catch (error: unknown) {
        if (getErrorMessage(error) === 'Goal not found') {
          res.status(404).json({ error: getErrorMessage(error) });
        } else if (getErrorMessage(error).includes('already completed')) {
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error completing goal:');
      res.status(500).json({ error: 'Failed to complete goal' });
    }
  };

  pauseGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { id } = req.params;

      try {
        const goal = await this.goalService.pauseGoal(id, userId);
        res.status(200).json(goal);
      } catch (error: unknown) {
        if (getErrorMessage(error) === 'Goal not found') {
          res.status(404).json({ error: getErrorMessage(error) });
        } else if (
          getErrorMessage(error).includes('already paused') ||
          getErrorMessage(error).includes('cannot be paused')
        ) {
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error pausing goal:');
      res.status(500).json({ error: 'Failed to pause goal' });
    }
  };

  resumeGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { id } = req.params;

      try {
        const goal = await this.goalService.resumeGoal(id, userId);
        res.status(200).json(goal);
      } catch (error: unknown) {
        if (getErrorMessage(error) === 'Goal not found') {
          res.status(404).json({ error: getErrorMessage(error) });
        } else if (getErrorMessage(error).includes('Only paused goals')) {
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error resuming goal:');
      res.status(500).json({ error: 'Failed to resume goal' });
    }
  };
}
