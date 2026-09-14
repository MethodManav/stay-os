import { Router, Request, Response, NextFunction } from 'express';
import { stayosMcpServer } from '../mcp/server';
import { resolveTenantMiddleware } from '../middleware/tenant';
import { BadRequestError } from '../core/errors/BadRequestError';

export const createMcpRouter = (): Router => {
  const router = Router();

  // List all available tools in MCP format
  router.get('/tools', (_req: Request, res: Response) => {
    const tools = stayosMcpServer.getGeminiFunctionDeclarations();
    res.status(200).json({
      success: true,
      tools
    });
  });

  // Execute an MCP tool with tenant verification
  router.post('/execute', resolveTenantMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tool, args } = req.body;
      if (!tool || typeof tool !== 'string') {
        throw new BadRequestError('Tool name is required');
      }

      if (!req.tenant) {
        throw new BadRequestError('Tenant context could not be verified');
      }

      const result = await stayosMcpServer.executeTool(tool, args || {}, req.tenant);
      res.status(200).json({
        success: !result.error,
        data: result
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export const mcpRouter = createMcpRouter();
export default mcpRouter;
