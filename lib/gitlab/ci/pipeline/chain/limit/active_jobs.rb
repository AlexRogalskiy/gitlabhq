# frozen_string_literal: true

module Gitlab
  module Ci
    module Pipeline
      module Chain
        module Limit
          class ActiveJobs < Chain::Base
            include ::Gitlab::Utils::StrongMemoize
            include ::Gitlab::Ci::Pipeline::Chain::Helpers

            LIMIT_NAME = :ci_active_jobs
            MESSAGE = "Project exceeded the allowed number of jobs in active pipelines. Retry later."

            def perform!
              return unless command.limit_active_jobs_early?
              return unless limits.exceeded?(LIMIT_NAME, count_jobs_in_alive_pipelines)

              error(MESSAGE, drop_reason: :job_activity_limit_exceeded)

              Gitlab::AppLogger.info(
                class: self.class.name,
                message: MESSAGE,
                project_id: project.id,
                plan: project.actual_plan_name)
            end

            def break?
              return unless command.limit_active_jobs_early?

              pipeline.errors.any?
            end

            private

            def namespace
              strong_memoize(:namespace) do
                project.namespace
              end
            end

            def limits
              strong_memoize(:limits) do
                namespace.actual_limits
              end
            end

            def count_jobs_in_alive_pipelines
              strong_memoize(:count_jobs_in_alive_pipelines) do
                count_persisted_jobs_in_all_alive_pipelines + count_current_pipeline_jobs
              end
            end

            def count_current_pipeline_jobs
              command.pipeline_seed.size
            end

            def count_persisted_jobs_in_all_alive_pipelines
              project.all_pipelines.jobs_count_in_alive_pipelines
            end
          end
        end
      end
    end
  end
end
