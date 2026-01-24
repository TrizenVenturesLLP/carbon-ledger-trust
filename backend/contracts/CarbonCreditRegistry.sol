// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract CarbonCreditRegistry is AccessControl {
    bytes32 public constant REGULATOR_ROLE = keccak256("REGULATOR_ROLE");
    
    struct Report {
        uint256 reportId;
        address company;
        uint256 credits;
        bool isApproved;
        uint256 approvedAt;
    }
    
    mapping(uint256 => Report) public reports;
    mapping(uint256 => bool) public registeredReports;
    
    event ReportRegistered(
        uint256 indexed reportId,
        address indexed company,
        uint256 indexed registryId
    );
    
    event ReportApproved(
        uint256 indexed reportId,
        uint256 credits
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGULATOR_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new emission report
     * @param reportId Unique report identifier
     * @param company Company address that submitted the report
     */
    function registerReport(
        uint256 reportId,
        address company
    ) external onlyRole(REGULATOR_ROLE) returns (uint256) {
        require(company != address(0), "Invalid company address");
        require(!registeredReports[reportId], "Report already registered");
        
        registeredReports[reportId] = true;
        
        reports[reportId] = Report({
            reportId: reportId,
            company: company,
            credits: 0,
            isApproved: false,
            approvedAt: 0
        });
        
        emit ReportRegistered(reportId, company, reportId);
        
        return reportId;
    }
    
    /**
     * @dev Approve a report and record credits to be issued
     * @param reportId Report identifier
     * @param credits Number of credits to issue
     */
    function approveReport(
        uint256 reportId,
        uint256 credits
    ) external onlyRole(REGULATOR_ROLE) returns (bool) {
        require(registeredReports[reportId], "Report not registered");
        require(!reports[reportId].isApproved, "Report already approved");
        require(credits > 0, "Credits must be greater than 0");
        
        reports[reportId].credits = credits;
        reports[reportId].isApproved = true;
        reports[reportId].approvedAt = block.timestamp;
        
        emit ReportApproved(reportId, credits);
        
        return true;
    }
    
    /**
     * @dev Get credits issued for a report
     * @param reportId Report identifier
     */
    function getReportCredits(uint256 reportId)
        external
        view
        returns (uint256)
    {
        require(registeredReports[reportId], "Report not registered");
        return reports[reportId].credits;
    }
    
    /**
     * @dev Check if report is registered
     * @param reportId Report identifier
     */
    function isReportRegistered(uint256 reportId)
        external
        view
        returns (bool)
    {
        return registeredReports[reportId];
    }
    
    /**
     * @dev Get report details
     * @param reportId Report identifier
     */
    function getReport(uint256 reportId)
        external
        view
        returns (
            address company,
            uint256 credits,
            bool isApproved,
            uint256 approvedAt
        )
    {
        require(registeredReports[reportId], "Report not registered");
        Report memory report = reports[reportId];
        
        return (
            report.company,
            report.credits,
            report.isApproved,
            report.approvedAt
        );
    }
}
