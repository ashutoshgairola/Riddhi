import { Request, Response } from 'express';

import { GoalService } from './service';
import { CreateGoalRequest, GetGoalsQuery, UpdateGoalRequest } from './types/interface';

export class GoalController {
  private goalService: GoalService;

  constructor(goalService: GoalService) {
    this.goalService = goalService;
  }

  getGoals = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const query: GetGoalsQuery = req.query as any;

      // Convert numeric query params
      if (query.page) {
        query.page = parseInt(query.page as any, 10);
      }

      if (query.limit) {
        query.limit = parseInt(query.limit as any, 10);
      }

      const goals = await this.goalService.getGoals(userId, query);
      res.status(200).json(goals);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ error: 'Failed to fetch goals' });
    }
  };

  getGoalById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      try {
        const goal = await this.goalService.getGoalById(id, userId);
        res.status(200).json(goal);
      } catch (error: any) {
        if (error.message === 'Goal not found') {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error fetching goal:', error);
      res.status(500).json({ error: 'Failed to fetch goal' });
    }
  };

  createGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const goalData: CreateGoalRequest = req.body;

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
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      try {
        const goal = await this.goalService.createGoal(userId, goalData);
        res.status(201).json(goal);
      } catch (error: any) {
        if (
          error.message.includes('date') ||
          error.message.includes('amount') ||
          error.message.includes('priority')
        ) {
          res.status(400).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error creating goal:', error);
      res.status(500).json({ error: 'Failed to create goal' });
    }
  };

  updateGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const updates: UpdateGoalRequest = req.body;

      try {
        const goal = await this.goalService.updateGoal(id, userId, updates);
        res.status(200).json(goal);
      } catch (error: any) {
        if (error.message === 'Goal not found') {
          res.status(404).json({ error: error.message });
        } else if (
          error.message.includes('date') ||
          error.message.includes('amount') ||
          error.message.includes('priority')
        ) {
          res.status(400).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error updating goal:', error);
      res.status(500).json({ error: 'Failed to update goal' });
    }
  };

  deleteGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      try {
        await this.goalService.deleteGoal(id, userId);
        res.status(204).send();
      } catch (error: any) {
        if (error.message === 'Goal not found') {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      res.status(500).json({ error: 'Failed to delete goal' });
    }
  };

  completeGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      try {
        const goal = await this.goalService.completeGoal(id, userId);
        res.status(200).json(goal);
      } catch (error: any) {
        if (error.message === 'Goal not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message.includes('already completed')) {
          res.status(400).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error completing goal:', error);
      res.status(500).json({ error: 'Failed to complete goal' });
    }
  };

  pauseGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      try {
        const goal = await this.goalService.pauseGoal(id, userId);
        res.status(200).json(goal);
      } catch (error: any) {
        if (error.message === 'Goal not found') {
          res.status(404).json({ error: error.message });
        } else if (
          error.message.includes('already paused') ||
          error.message.includes('cannot be paused')
        ) {
          res.status(400).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error pausing goal:', error);
      res.status(500).json({ error: 'Failed to pause goal' });
    }
  };

  resumeGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      try {
        const goal = await this.goalService.resumeGoal(id, userId);
        res.status(200).json(goal);
      } catch (error: any) {
        if (error.message === 'Goal not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message.includes('Only paused goals')) {
          res.status(400).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error resuming goal:', error);
      res.status(500).json({ error: 'Failed to resume goal' });
    }
  };
}
