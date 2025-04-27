import { Request, Response } from "express";
import { BudgetService } from "./service";
import {
  GetBudgetsQuery,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  CreateBudgetCategoryRequest,
  UpdateBudgetCategoryRequest,
} from "./types/interface";

export class BudgetController {
  private budgetService: BudgetService;

  constructor(budgetService: BudgetService) {
    this.budgetService = budgetService;
  }

  getCurrentBudget = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const budget = await this.budgetService.getCurrentBudget(userId);

      if (!budget) {
        res.status(404).json({ error: "No current budget found" });
        return;
      }

      res.status(200).json(budget);
    } catch (error: any) {
      console.error("Error fetching current budget:", error);
      res.status(500).json({ error: "Failed to fetch current budget" });
    }
  };

  getBudgets = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const query: GetBudgetsQuery = req.query as any;

      // Convert numeric query params
      if (query.page) {
        query.page = parseInt(query.page as any, 10);
      }

      if (query.limit) {
        query.limit = parseInt(query.limit as any, 10);
      }

      const budgets = await this.budgetService.getBudgets(userId, query);
      res.status(200).json(budgets);
    } catch (error: any) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ error: "Failed to fetch budgets" });
    }
  };

  getBudgetById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      try {
        const budget = await this.budgetService.getBudgetById(id, userId);
        res.status(200).json(budget);
      } catch (error: any) {
        if (error.message === "Budget not found") {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error fetching budget:", error);
      res.status(500).json({ error: "Failed to fetch budget" });
    }
  };

  createBudget = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const budgetData: CreateBudgetRequest = req.body;

      // Basic validation
      if (
        !budgetData.name ||
        !budgetData.startDate ||
        !budgetData.endDate ||
        !Array.isArray(budgetData.categories) ||
        budgetData.income === undefined
      ) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      try {
        const budget = await this.budgetService.createBudget(
          userId,
          budgetData
        );
        res.status(201).json(budget);
      } catch (error: any) {
        if (
          error.message.includes("overlap") ||
          error.message.includes("date") ||
          error.message.includes("Category")
        ) {
          res.status(400).json({ error: error.message });
        } else if (
          error.message.includes("conflict") ||
          error.message.includes("overlap")
        ) {
          res.status(409).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error creating budget:", error);
      res.status(500).json({ error: "Failed to create budget" });
    }
  };

  updateBudget = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const updates: UpdateBudgetRequest = req.body;

      try {
        const budget = await this.budgetService.updateBudget(
          id,
          userId,
          updates
        );
        res.status(200).json(budget);
      } catch (error: any) {
        if (error.message === "Budget not found") {
          res.status(404).json({ error: error.message });
        } else if (
          error.message.includes("date") ||
          error.message.includes("invalid")
        ) {
          res.status(400).json({ error: error.message });
        } else if (error.message.includes("overlap")) {
          res.status(409).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error updating budget:", error);
      res.status(500).json({ error: "Failed to update budget" });
    }
  };

  deleteBudget = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      try {
        await this.budgetService.deleteBudget(id, userId);
        res.status(204).send();
      } catch (error: any) {
        if (error.message === "Budget not found") {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error deleting budget:", error);
      res.status(500).json({ error: "Failed to delete budget" });
    }
  };

  createBudgetCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const categoryData: CreateBudgetCategoryRequest = req.body;

      // Basic validation
      if (
        !categoryData.name ||
        categoryData.allocated === undefined ||
        !categoryData.categoryId
      ) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      try {
        const category = await this.budgetService.createBudgetCategory(
          id,
          userId,
          categoryData
        );
        res.status(201).json(category);
      } catch (error: any) {
        if (error.message === "Budget not found") {
          res.status(404).json({ error: error.message });
        } else if (
          error.message.includes("already exists") ||
          (error.message.includes("not found") &&
            error.message.includes("category"))
        ) {
          res.status(400).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error creating budget category:", error);
      res.status(500).json({ error: "Failed to create budget category" });
    }
  };

  updateBudgetCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { budgetId, categoryId } = req.params;
      const updates: UpdateBudgetCategoryRequest = req.body;

      try {
        const category = await this.budgetService.updateBudgetCategory(
          budgetId,
          categoryId,
          userId,
          updates
        );
        res.status(200).json(category);
      } catch (error: any) {
        if (
          error.message === "Budget not found" ||
          error.message === "Budget category not found"
        ) {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error updating budget category:", error);
      res.status(500).json({ error: "Failed to update budget category" });
    }
  };

  deleteBudgetCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { budgetId, categoryId } = req.params;

      try {
        await this.budgetService.deleteBudgetCategory(
          budgetId,
          categoryId,
          userId
        );
        res.status(204).send();
      } catch (error: any) {
        if (
          error.message === "Budget not found" ||
          error.message === "Budget category not found"
        ) {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error deleting budget category:", error);
      res.status(500).json({ error: "Failed to delete budget category" });
    }
  };
}
