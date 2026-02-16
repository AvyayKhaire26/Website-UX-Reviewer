import React, { createContext, useContext, ReactNode } from 'react';
import { ReviewService } from '../api/reviewService';

interface IReviewService {
  createReview: typeof ReviewService.createReview;
  getReviewHistory: typeof ReviewService.getReviewHistory;
  getReviewById: typeof ReviewService.getReviewById;
  checkHealth: typeof ReviewService.checkHealth;
  checkLLMHealth: typeof ReviewService.checkLLMHealth;
  checkDatabaseHealth: typeof ReviewService.checkDatabaseHealth;
  checkScreenshotHealth: typeof ReviewService.checkScreenshotHealth;
}

interface ServiceContextType {
  reviewService: IReviewService;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

interface ServiceProviderProps {
  children: ReactNode;
  reviewService?: IReviewService;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ 
  children, 
  reviewService = ReviewService
}) => {
  return (
    <ServiceContext.Provider value={{ reviewService }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = (): ServiceContextType => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within ServiceProvider');
  }
  return context;
};
